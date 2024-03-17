import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { InventoryForm } from "../../components/InventoryFormContext/inventoryForm.types";
import { supabase } from "../supabase";

const updateRecords = async (records: DeliveryForm | InventoryForm) => {
  if (!Object.keys(records).length) return;
  const recordsToUpdate = Object.entries(records).map(
    ([record_id, { quantity, price_per_unit }]) => {
      return {
        id: Number(record_id),
        price_per_unit,
        quantity,
      };
    }
  );
  const data = await Promise.all(
    recordsToUpdate.map(({ quantity, price_per_unit, id }) =>
      supabase
        .from("product_record")
        .update({ quantity, price_per_unit })
        .eq("id", id)
        .select()
        .single()
    )
  );
  return data.map((d) => d.data);
};

export const useUpdateRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records) => await updateRecords(records),
    onMutate: async (records: DeliveryForm) => {
      const recordsIterable = Object.entries(records);
      // concurrency
      await Promise.all(
        recordsIterable.map(([recordId, _record]) => {
          queryClient.cancelQueries(["product_record", recordId]);
          queryClient.setQueryData(
            ["product_record", recordId],
            (old: any) => ({ ...old, ...records[recordId] })
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
