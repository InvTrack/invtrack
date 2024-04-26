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
      mutationKey: ["createProductRecords", inventoryId],
      onMutate: async () => {
        queryClient.cancelQueries(["recordsList", inventoryId]);
        queryClient.cancelQueries([
          "listCategorizedProductRecords",
          inventoryId,
        ]);
        queryClient.cancelQueries([
          "listUncategorizedProductRecords",
          inventoryId,
        ]);
        queryClient.cancelQueries(["missingProducts", inventoryId]);
        // we cannot setQueryData here because we don't have the record id,
        // which is needed to correctly send patch requests in the form
      },
      onSuccess: async (_newRecords) => {
        // cannot update relevant queries here - no product order data available in product_record response
      },
      onSettled: async () => {
        queryClient.invalidateQueries({
          queryKey: ["missingProducts", inventoryId],
          exact: true,
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["recordsList", inventoryId],
          exact: true,
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["listCategorizedProductRecords", inventoryId],
          exact: true,
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["listUncategorizedProductRecords", inventoryId],
          exact: true,
          refetchType: "all",
        });
      },
    }
  );
};
