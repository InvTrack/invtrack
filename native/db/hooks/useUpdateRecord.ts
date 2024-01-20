import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { supabase } from "../supabase";

const updateRecords = async (records: DeliveryForm, inventoryId: number) => {
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

  return useMutation((records) => updateRecords(records, inventoryId), {
    onMutate: async (records: DeliveryForm) => {
      const recordsIterable = Object.entries(records);
      // concurrency
      Promise.all(
        recordsIterable.map(([recordId, _record]) => {
          queryClient.cancelQueries(["product_record", recordId]);
        })
      );
    },
    onSettled: async (data) => {
      if (!data) return;
      Promise.all(
        data?.map(({ id: recordId }) => {
          queryClient.invalidateQueries(["product_record", recordId]);
        })
      );
    },
  });
};
