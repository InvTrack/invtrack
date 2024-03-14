export const load = async ({ parent }) => {
  const { supabase } = await parent();
  const { data: products } = await supabase
    .from("product")
    .select("*")
    .order("display_order", { ascending: true });

  const uncategorisedProducts = products?.filter((p) => !p.category_id);

  const { data: productCategories } = await supabase
    .from("product_category")
    .select(
      `*,
       products:product(*)
    `
    )
    .order("display_order", { ascending: true });

  return {
    productCategories: productCategories?.map((pc) => ({
      ...pc,
      products: pc.products.sort((a, b) => a.display_order - b.display_order),
    })),
    products,
    uncategorisedProducts: uncategorisedProducts,
  };
};
