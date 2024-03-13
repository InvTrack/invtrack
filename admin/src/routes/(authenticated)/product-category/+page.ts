export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: productCategories } = await supabase.from("product_category").select("*");

  return {
    productCategories,
  };
};
