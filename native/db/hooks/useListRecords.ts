import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecords = async (inventoryId: number) => {
  const { data, error } = await supabase
    .from("record_view")
    .select()
    .eq("inventory_id", inventoryId)
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};
export const useListRecords = (inventoryId: number) => {
  const query = useQuery(["recordsList", inventoryId], () =>
    listRecords(inventoryId)
  );
  return query;
};
