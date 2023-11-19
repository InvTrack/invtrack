import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { Product, Record } from "../types";

type ListBarcodesRes = {
  barcodes: Product["barcodes"];
  record_view: [{ id: Record["id"] }];
}[];

const listBarcodes = async (inventory_id: number) => {
  const res = await supabase
    .from("product")
    .select("barcodes, record_view(id)")
    .eq("record_view.inventory_id", inventory_id);

  return {
    ...res,
    data: res.data as ListBarcodesRes,
  };
};

export const useListBarcodes = ({ inventoryId }: { inventoryId: number }) => {
  const query = useQuery(
    ["listBarcodes", inventoryId],
    async () => await listBarcodes(inventoryId)
  );
  return { ...query, data: query.data?.data };
};
