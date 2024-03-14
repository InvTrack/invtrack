import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";

const insertProductRecords = async (
  records: { product_id: number; quantity?: number }[],
  inventoryId: number
) => {
  const insert = records.map(
    (record) =>
      ({
        quantity: record.quantity ?? 0,
        product_id: record.product_id,
        inventory_id: inventoryId,
      } as const)
  );
  const { data } = await supabase
    .from("product_record")
    .insert(insert)
    .select();
  return data;
};
export const useCreateProductRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    (
      records: {
        product_id: number;
        quantity?: number;
      }[]
    ) => insertProductRecords(records, inventoryId),
    {
      onMutate: () => {
        queryClient.cancelQueries(["recordsList", inventoryId]);
        // we cannot setQueryData here because we don't have the record id,
        // which is needed to correctly send patch requests in the form
      },
      onSuccess: (_newRecords) => {
        // console.log("newRecords", newRecords);
        // queryClient.setQueryData<ReturnType<typeof useListProductRecords>["data"]>(
        //   ["recordsList", inventoryId],
        //   (old) => {
        //     if (!old) return;
        //     if (!newRecords) return old;
        //     return [...old];
        //   }
        // );
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["recordsList", inventoryId],
          exact: true,
          refetchType: "all",
        });
      },
    }
  );
};
