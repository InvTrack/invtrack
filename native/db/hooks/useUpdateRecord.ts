import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { supabase } from "../supabase";

const updateRecords = async (records: DeliveryForm, inventoryId: number) => {
  if (!Object.keys(records).length) return;
  const rec = Object.entries(records).map(
    ([record_id, { quantity, product_id }]) => ({
      id: Number(record_id),
      inventory_id: inventoryId,
      product_id,
      quantity,
    })
  );
  const { data, error } = await supabase
    .from("product_record")
    .upsert(rec, {
      onConflict: "id",
    })
    .select();
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records) => await updateRecords(records, inventoryId),
    onMutate: async (records: DeliveryForm) => {
      const recordsIterable = Object.entries(records);
      // concurrency
      await Promise.all(
        recordsIterable.map(([recordId, _record]) => {
          queryClient.setQueryData(
            ["product_record", recordId],
            (old: any) => ({ ...old, ...records[recordId] })
          );
          queryClient.cancelQueries(["product_record", recordId]);
          return void this;
        })
      );
    },
    onSettled: async (data) => {
      if (!data) return;
      queryClient.invalidateQueries(["recordsList", inventoryId], {
        exact: true,
        refetchType: "all",
      });
      data?.map(({ id: recordId }) => {
        queryClient.invalidateQueries(["product_record", recordId], {
          exact: true,
          refetchType: "all",
        });
      });
    },
  });
};
