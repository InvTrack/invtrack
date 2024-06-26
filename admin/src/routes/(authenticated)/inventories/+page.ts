import { error } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: inventories, error: supabaseError } = await supabase
    .from("inventory")
    .select()
    .order("date", { ascending: false });

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    inventories,
  };
};
