import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: recipe, error: supabaseError } = await supabase
    .from("recipe")
    .select(
      `
      *,
      recipe_part(*),
      name_alias(alias)
    `
    )
    .eq("id", id)
    .single();

  const { data: products, error: supabaseError2 } = await supabase.from("product").select();

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Recipe not found.");
  }
  if (supabaseError2) {
    console.error(supabaseError2);
    throw error(404, "Products not found.");
  }

  const sortedProducts = products.sort((a, b) => {
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    return x.localeCompare(y);
  });

  return {
    recipe,
    products: sortedProducts,
  };
};
