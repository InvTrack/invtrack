import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecipesOfStock = async (stockId: number) => {
  if (stockId == null)
    throw new Error("useListRecipes - inventoryId is null, should be defined");
  const { data, error } = await supabase
    .from("recipe")
    .select(
      "id, name, recipe_part(quantity, product_id), recipe_record(id, quantity)"
    )
    .order("name", { ascending: true })
    .eq("recipe_record.inventory_id", stockId);
  if (error) throw new Error(error.message);
  return data;
};

const listAllRecipes = async (inventoryId?: number) => {
  if (inventoryId == null)
    throw new Error("useListRecipes - inventoryId is null, should be defined");
  const { data, error } = await supabase
    .from("recipe")
    .select("id, name, recipe_part(quantity, product_id)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

export const useListRecipes = () => {
  return useQuery(["recipeList"], () => listAllRecipes());
};

export const useListRecipesWithRecords = (stockId: number) => {
  return useQuery(["recipeList", stockId], () => listRecipesOfStock(stockId));
};
