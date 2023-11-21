import { useQuery } from "@tanstack/react-query";

import isEmpty from "lodash/isEmpty";
import { supabase } from "../supabase";
import { Product, Record } from "../types";

type ListBarcodePostgrestRes =
  | {
      barcodes: Product["barcodes"];
      record_view: [{ id: Record["id"] } | null];
    }[]
  | null;

type ListBarcodeReturn = {
  [barcode: Product["barcodes"][number]]: Record["id"];
};

const listBarcodes = async (inventory_id: number) => {
  const res = await supabase
    .from("product")
    .select("barcodes, record_view(id)")
    .eq("record_view.inventory_id", inventory_id);

  const data = res.data as ListBarcodePostgrestRes;
  if (!data) return null;

  const reducedData = data.reduce((result, item) => {
    const barcodes = item.barcodes;
    const recordId = item.record_view?.[0]?.id;
    if (!recordId) return result;
    barcodes.forEach((barcode) => {
      result[barcode] = recordId;
    });
    return result;
  }, {} as ListBarcodeReturn);

  if (isEmpty(reducedData)) return null;

  return {
    ...res,
    data: reducedData,
  };
};

export const useListBarcodes = ({ inventoryId }: { inventoryId: number }) => {
  const query = useQuery(
    ["listBarcodes", inventoryId],
    async () => await listBarcodes(inventoryId)
  );
  return { ...query, data: query.data?.data as ListBarcodeReturn | null };
};
