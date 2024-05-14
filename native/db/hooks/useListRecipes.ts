import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecipes = async (inventoryId: number) => {
  const { data, error } = await supabase
    .from("recipe")
    .select(
      "id, name, recipe_part(quantity, product_id), recipe_record(id, quantity)"
    )
    .order("name", { ascending: true })
    .eq("recipe_record.inventory_id", inventoryId);
  if (error) throw new Error(error.message);
  return data;
};
export const useListRecipes = (inventoryId: number) => {
  const query = useQuery(["recipeList"], () => listRecipes(inventoryId));
  return query;
};
