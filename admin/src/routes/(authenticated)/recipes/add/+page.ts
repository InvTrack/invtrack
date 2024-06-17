import { error } from "@sveltejs/kit";
export const load = async ({ parent }) => {
  const { supabase } = await parent();

  const { data: products, error: supabaseError2 } = await supabase.from("product").select();

  if (supabaseError2) {
    console.error(supabaseError2);
    throw error(404, "Products not found.");
  }
  const sortedProducts = products.sort((a, b) => {
    const x = a.name.toLowerCase();
    const y = b.name.toLowerCase();
    return x.localeCompare(y);
  });

  return {
    supabase,
    products: sortedProducts,
  };
};
