export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();
  const { data: inventory } = await supabase.from("inventory").select().eq("id", id).single();

  return {
    inventory,
  };
};
