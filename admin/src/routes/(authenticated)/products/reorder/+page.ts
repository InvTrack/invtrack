export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: products } = await supabase.from("product").select("*");

  const uncategorisedProducts = products?.filter((p) => !p.category_id);

  const { data: productCategories } = await supabase.from("product_category").select(`
      *,
      product(*)
    `);

  return {
    productCategories,
    products,
    uncategorisedProducts,
  };
};
