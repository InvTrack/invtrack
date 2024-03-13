import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: productCategory, error: supabaseError } = await supabase
    .from("product_category")
    .select()
    .eq("id", id)
    .single();

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    productCategory,
  };
};
