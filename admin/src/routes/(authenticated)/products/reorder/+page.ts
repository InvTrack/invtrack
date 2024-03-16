import type { LoadFunctionArgument } from "$lib/helpers";

// TODO: This file is identical to the +page.ts in the directory above. Reuse the data from here
export const load = async ({ parent }: LoadFunctionArgument) => {
  const { supabase } = await parent();
  const { data: products } = await supabase
    .from("product")
    .select("*")
    .order("display_order", { ascending: true });

  const uncategorisedProducts = products?.filter((p) => !p.category_id);

  const { data: categories } = await supabase
    .from("product_category")
    .select(
      `*,
       items:product(*)
    `
    )
    .order("display_order", { ascending: true });

  return {
    categories: categories?.map((category) => ({
      ...category,
      items: category.items.sort((a, b) => a.display_order - b.display_order),
    })),
    products,
    uncategorisedProducts: uncategorisedProducts,
  };
};
