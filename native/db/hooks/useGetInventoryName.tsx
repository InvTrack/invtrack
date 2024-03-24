import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
const getInventoryName = async (inventoryId: number) => {
  const res = await supabase
    .from("inventory")
    .select("name")
    .eq("id", inventoryId)
    .single();
  if (res.error) console.log(res.error);
  return res.data?.name ?? "";
};

export const useGetInventoryName = (inventoryId: number) =>
  useQuery({
    queryKey: ["inventoryName", inventoryId],
    queryFn: async () => await getInventoryName(inventoryId),
  });
