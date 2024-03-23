import type { LoadFunctionArgument } from "$lib/helpers";
import { error } from "@sveltejs/kit";

export const load = async ({ parent }: LoadFunctionArgument) => {
  const { supabase } = await parent();
  const { data: products, error: error1 } = await supabase
    .from("existing_products")
    .select("*")
    .order("display_order", { ascending: true });

  const uncategorisedProducts = products?.filter((p) => !p.category_id);

  const { data: categories, error: error2 } = await supabase
    .from("product_category")
    .select(
      `*,
       items:existing_products(*)
    `
    )
    .order("display_order", { ascending: true });

  if (error1) {
    console.error(error1);
    throw error(404, "Product not found.");
  }
  if (error2) {
    console.error(error2);
    throw error(404, "Categories not found.");
  }
  return {
    categories: categories?.map((category) => ({
      ...category,
      items: category.items.sort((a, b) => a.display_order - b.display_order),
    })),
    products,
    uncategorisedProducts: uncategorisedProducts,
  };
};
