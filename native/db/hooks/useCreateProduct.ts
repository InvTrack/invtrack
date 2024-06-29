import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { useCreateProductRecords } from "./useCreateProductRecords";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";
type InsertProductMutationArgs = {
  name: string;
  unit: string;
  steps: number[];
  company_id: number | undefined | null;
};
const insertProduct = async (
  { name, unit, steps, company_id }: InsertProductMutationArgs,
  createProductRecords: ReturnType<typeof useCreateProductRecords>["mutate"]
) => {
  if (company_id == null) {
    throw new Error("insertProduct - missing company_id");
  }
  const { data, error } = await supabase
    .from("product")
    .insert({
      name,
      unit,
      steps,
      company_id,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  createProductRecords([
    {
      product_id: data.id,
      quantity: 0,
    },
  ]);

  return data;
};

/**
 * Creates a new product, and inserts it into the provided inventory/delivery
 */
export const useCreateProduct = (inventoryId: number) => {
  const queryClient = useQueryClient();
  const { data } = useGetCurrentCompanyId();
  const { mutate: createProductRecords } = useCreateProductRecords(inventoryId);

  return useMutation(
    (product: Omit<InsertProductMutationArgs, "company_id">) =>
      insertProduct({ ...product, company_id: data?.id }, createProductRecords),
    {
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
        queryClient.cancelQueries(["existingProducts"]);
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
          queryKey: ["existingProducts"],
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
