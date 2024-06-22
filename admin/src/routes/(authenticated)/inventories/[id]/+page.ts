import { error } from "@sveltejs/kit";

export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: inventory, error: supabaseError } = await supabase
    .from("inventory")
    .select()
    .eq("id", id)
    .single();

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    inventory,
  };
};
