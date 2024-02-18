import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { supabase } from "../supabase";

const updateRecords = async (records: DeliveryForm) => {
  if (!Object.keys(records).length) return;
  const recordsToUpdate = Object.entries(records).map(
    ([record_id, { quantity }]) => ({
      id: Number(record_id),
      quantity,
    })
  );
  const data = await Promise.all(
    recordsToUpdate.map(({ quantity, id }) =>
      supabase
        .from("product_record")
        .update({ quantity })
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
          queryClient.setQueryData(
            ["product_record", recordId],
            (old: any) => ({ ...old, ...records[recordId] })
          );
          queryClient.cancelQueries(["product_record", recordId]);
        })
      );
    },
    onSettled: async (data) => {
      if (data) {
        await queryClient.invalidateQueries(["recordsList", inventoryId], {
          exact: true,
          refetchType: "all",
        });
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
