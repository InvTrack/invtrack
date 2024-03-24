import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listMissingProducts = async (inventoryId: number) => {
  const allProductsReq = await supabase.from("existing_products").select("id");
  const allProducts = allProductsReq.data?.map((product) => product.id);
  if (!allProducts) return [];

  const productsInInventoryReq = await supabase
    .from("product_record")
    .select("product_id")
    .eq("inventory_id", inventoryId);
  const productsInInventory = productsInInventoryReq.data?.map(
    (product) => product.product_id
  );
  if (!productsInInventory) return [];

  const productsNotInInventory = allProducts?.filter(
    (product) => !productsInInventory?.includes(product)
  );
  if (!productsNotInInventory) return [];

  const productsNotInInventoryReq = await supabase
    .from("existing_products")
    .select("id, name, unit, steps")
    .in("id", productsNotInInventory);
  return productsNotInInventoryReq.data ?? [];
};

export const useListMissingProducts = (inventoryId: number) =>
  useQuery(
    ["missingProducts", inventoryId],
    async () => await listMissingProducts(inventoryId)
  );
