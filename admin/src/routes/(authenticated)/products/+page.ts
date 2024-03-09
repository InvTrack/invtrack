export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: products } = await supabase.from("product").select("*");

  const uncategorisedProducts = products.filter(p => !p.category)

  const { data: productCategories } = await supabase
    .from("product_category")
    .select(`
      *,
      product(*)
    `);

  console.log(productCategories, uncategorisedProducts)

  return {
    productCategories,
    products, uncategorisedProducts
  };
};
