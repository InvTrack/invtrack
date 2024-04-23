import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StockForm } from "../../components/StockFormContext/types";
import { supabase } from "../supabase";

const updateRecordsForm = async (form: StockForm) => {
  if (
    !Object.keys(form.product_records).length ||
    !Object.keys(form.recipe_records).length
  )
    return;

  const data = await Promise.all(
    Object.entries(form.product_records)
      .map(([record_id, { quantity, price_per_unit }]) => {
        return supabase
          .from("product_record")
          .update({ quantity, price_per_unit })
          .eq("id", Number(record_id))
          .select()
          .single();
      })
      .concat(
        Object.entries(form.recipe_records).map(([record_id, { quantity }]) => {
          return supabase
            .from("recipe_record")
            .update({ quantity })
            .eq("id", Number(record_id))
            .select()
            .single();
        })
      )
  );
  return data.map((d) => d.data);
};

export const useUpdateRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form) => await updateRecordsForm(form),
    onMutate: async (form: StockForm) => {
      const recordsIterable = Object.entries(form.product_records);
      // concurrency
      await Promise.all(
        recordsIterable.map(([recordId, _record]) => {
          queryClient.cancelQueries(["product_record", recordId]);
          queryClient.setQueryData(
            ["product_record", recordId],
            (old: any) => ({ ...old, ...form.product_records[recordId] })
          );
        })
      );
    },
    onSettled: async (data) => {
      if (data) {
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
          data.map((updatedRecord) => {
            const recordId = updatedRecord?.id;
            if (!recordId) return;
            queryClient.invalidateQueries(["product_record", recordId], {
              exact: true,
              refetchType: "all",
            });
          })
        );
      }
    },
  });
};
