import { error } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: recipes, error: error1 } = await supabase
    .from("recipe")
    .select("*");

  if (error1) {
    console.error(error1);
    throw error(404, "Recipes not found.");
  }
  return {
    recipes,
  };
};
