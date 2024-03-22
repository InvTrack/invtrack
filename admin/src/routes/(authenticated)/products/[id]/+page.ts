import type { LoadFunctionWithIdArgument } from "$lib/helpers";
import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }: LoadFunctionWithIdArgument) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: product, error: supabaseError } = await supabase
    .from("product")
    .select(`
      *,
      barcode(*)
    `)
    .eq("id", id)
    .single();

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    product,
  };
};
