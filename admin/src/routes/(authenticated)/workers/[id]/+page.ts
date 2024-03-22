import type { LoadFunctionWithIdArgument } from "$lib/helpers";
import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }: LoadFunctionWithIdArgument) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: worker, error: supabaseError } = await supabase
    .from("worker")
    .select()
    .eq("id", id)
    .single();

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    worker,
  };
};
