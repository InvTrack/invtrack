import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { InventoryTable } from "../types";

export const useGetInventoryName = (inventoryId: number | undefined | null) => {
  const query = useQuery(["inventoryName", inventoryId], async () => {
    const res = await supabase
      .from<"inventory", InventoryTable>("inventory")
      .select("name")
      .eq("id", inventoryId)
      .single();
    return {
      ...res,
      data: res.data?.name,
    };
  });
  return { ...query, data: query.data?.data };
};
