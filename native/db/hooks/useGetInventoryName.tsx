import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { InventoryTable } from "../types";
const getInventoryName = async (
  context: QueryFunctionContext<[string, { inventoryId: number }]>
) => {
  const [, { inventoryId }] = context.queryKey;
  const res = await supabase
    .from<"inventory", InventoryTable>("inventory")
    .select("name")
    .eq("id", inventoryId)
    .single();
  return {
    ...res,
    data: res.data?.name,
  };
};

export const useGetInventoryName = (inventoryId: number) => {
  const query = useQuery({
    queryKey: ["inventoryName", { inventoryId }],
    queryFn: getInventoryName,
  });
  return { ...query, data: query.data?.data };
};
