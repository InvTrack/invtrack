import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

export type UseGetRecordQueryKey = [
  "product_record",
  inventoryId: number,
  productId: number
];

const getRecord = async (inventoryId: number, productId: number) => {
  const { data, error } = await supabase
    .from("record_view")
    .select()
    .eq("inventory_id", inventoryId)
    .eq("product_id", productId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const useGetRecord = (inventoryId: number, productId: number) => {
  const query = useQuery(["product_record", inventoryId, productId], () =>
    getRecord(inventoryId, productId)
  );
  return query;
};
