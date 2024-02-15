export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: products } = await supabase.from("product").select("*");

  return {
    products,
  };
};
