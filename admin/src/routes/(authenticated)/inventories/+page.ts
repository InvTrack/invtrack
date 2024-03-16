import type { LoadFunctionArgument } from "$lib/helpers";

export const load = async ({ parent }: LoadFunctionArgument) => {
  const { supabase } = await parent();
  const { data: inventories } = await supabase
    .from("inventory")
    .select()
    .order("date", { ascending: false });

  return {
    inventories,
  };
};
