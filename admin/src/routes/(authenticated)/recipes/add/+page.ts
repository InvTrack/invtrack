import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();

  const { data: products, error: supabaseError2 } = await supabase
    .from("product")
    .select();

  if (supabaseError2) {
    console.error(supabaseError2);
    throw error(404, "Products not found.");
  }
  return {
    supabase,
    products
  };
};
