import { supabase } from "$lib/supabase";

let range = [0, 9] as const;
export async function load() {
  console.log("run");
  const { data: inventoryData } = await supabase
    .from("inventory")
    .select()
    .range(...range);

  const { data: productData } = await supabase
    .from("product")
    .select(`*, product_record (*)`)
    .range(...range, {
      foreignTable: "product_record",
    });
  // errors?? TODO: not empty data forever
  return {
    products: !productData ? [] : productData,
    inventories: !inventoryData ? [] : inventoryData,
  };
}
