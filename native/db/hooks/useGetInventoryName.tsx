import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { InventoryTable } from "../types";

export const useGetInventoryName = (inventoryId: number) => {
  const query = useQuery(["inventoryName", inventoryId], async () => {
    const res = await supabase
      .from<"inventory", InventoryTable>("inventory")
      .select("name")
      .eq("id", inventoryId);
    return {
      ...res,
      data: res.data?.[0].name,
    };
  });
  return { ...query, data: query.data?.data };
};
