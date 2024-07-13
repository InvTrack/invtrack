import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StockForm } from "../../components/StockFormContext/types";
import { supabase } from "../supabase";

const updateRecordsForm = async (form: StockForm, inventoryId: number) => {
  if (
    Object.keys(form.product_records).length &&
    Object.keys(form.recipe_records).length
  )
    return;

  const data = await Promise.all([
    (
      await Promise.all(
        Object.entries(form.product_records)
          .filter(([_, { id }]) => !!id)
          .map(([product_id, { quantity, price_per_unit }]) => {
            return supabase
              .from("product_record")
              .update({ quantity, price_per_unit })
              .eq("inventory_id", inventoryId)
              .eq("product_id", product_id)
              .select()
              .single();
          })
      )
    ).map((it) => it.data),
    (
      await Promise.all(
        Object.entries(form.product_records)
          .filter(([_, { id }]) => !id)
          .map(([product_id, { quantity, price_per_unit }]) => {
            return supabase.from("product_record").insert({
              product_id: parseInt(product_id),
              quantity,
              price_per_unit,
              inventory_id: inventoryId,
            });
          })
      )
    ).map((it) => it.data),
    (
      await Promise.all(
        Object.entries(form.recipe_records).map(([record_id, { quantity }]) => {
          return supabase
            .from("recipe_record")
            .update({ quantity })
            .eq("id", Number(record_id))
            .select()
            .single();
        })
      )
    ).map((it) => it.data),
  ]);
  return { products: data[0], recipes: data[2] };
};

export const useUpdateRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form) => await updateRecordsForm(form, inventoryId),
    onMutate: async (form: StockForm) => {
      const recordsIterable = Object.entries(form.product_records);
      await Promise.all(
        recordsIterable.map(([productId, _record]) => {
          queryClient.cancelQueries(["product_record", inventoryId, productId]);
          queryClient.setQueryData(
            ["product_record", inventoryId, productId],
            (old: any) => ({ ...old, ...form.product_records[productId] })
          );
        })
      );
      const recipesIterable = Object.entries(form.recipe_records);
      await Promise.all(
        recipesIterable.map(([recordId, _record]) => {
          queryClient.cancelQueries(["recipeRecord", recordId]);
          queryClient.setQueryData(["recipeRecord", recordId], (old: any) => ({
            ...old,
            ...form.recipe_records[recordId],
          }));
        })
      );
    },
    onSettled: async (data) => {
      if (data?.products) {
        await queryClient.invalidateQueries(["recordsList", inventoryId], {
          exact: true,
          refetchType: "all",
        });
        await queryClient.invalidateQueries([
          "listCategorizedProductRecords",
          inventoryId,
        ]);
        await queryClient.invalidateQueries([
          "listUncategorizedProductRecords",
          inventoryId,
        ]);
        await Promise.all(
          data.products.map((updatedRecord) => {
            const productId = updatedRecord?.product_id;
            if (!productId) return;
            queryClient.invalidateQueries(
              ["product_record", inventoryId, productId],
              {
                exact: true,
                refetchType: "all",
              }
            );
          })
        );
      } else if (data?.recipes) {
        await queryClient.invalidateQueries(
          ["recipeRecordsList", inventoryId],
          {
            exact: true,
            refetchType: "all",
          }
        );
        await Promise.all(
          data.recipes.map((updatedRecord) => {
            const recordId = updatedRecord?.id;
            if (!recordId) return;
            queryClient.invalidateQueries(["recipeRecord", recordId], {
              exact: true,
              refetchType: "all",
            });
          })
        );
      }
    },
  });
};
