export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: inventories } = await supabase
    .from("inventory")
    .select()
    .order("date", { ascending: false });

  return {
    inventories,
  };
};
