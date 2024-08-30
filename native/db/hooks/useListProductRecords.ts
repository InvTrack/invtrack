import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecords = async (inventoryId: number) => {
  const { data, error } = await supabase
    .from("record_view")
    .select()
    .eq("inventory_id", inventoryId)
    .order("display_order", { ascending: true, nullsFirst: true });
  if (error) throw new Error(error.message);
  return data;
};
export const useListProductRecords = (stockId?: number) => {
  const query = useQuery(
    ["recordsList", stockId],
    () => listRecords(stockId!),
    { enabled: !!stockId }
  );
  return query;
};
