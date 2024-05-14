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
export const useListRecipeRecords = (inventoryId: number) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["recipeRecordsList", inventoryId],
    queryFn: () => listRecipeRecords(inventoryId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["recipeRecord"],
      }),
  });
  return query;
};
