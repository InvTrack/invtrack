import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecipeRecords = async (inventoryId: number) => {
  const { data, error } = await supabase
    .from("recipe_record")
    .select()
    .eq("inventory_id", inventoryId);
  if (error) throw new Error(error.message);
  return data;
};
export const useListRecipeRecords = (stockId?: number) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["recipeRecordsList", stockId],
    queryFn: () => listRecipeRecords(stockId!),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["recipeRecord"],
      }),
    enabled: !!stockId,
  });
  return query;
};
