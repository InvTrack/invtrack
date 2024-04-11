import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listRecipes = async () => {
  const { data, error } = await supabase
    .from("recipe")
    .select("id, name, recipe_part(quantity, product_id)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};
export const useListRecipes = () => {
  const query = useQuery(["recipeList"], () => listRecipes());
  return query;
};
