import { useQuery } from "@tanstack/react-query";

import isEmpty from "lodash/isEmpty";
import { supabase } from "../supabase";
import { Product, RecordView } from "../types";

type ListBarcodePostgrestRes =
  | {
      barcodes: Product["barcodes"];
      record_view: [
        {
          id: RecordView["id"];
          name: RecordView["name"];
          product_id: RecordView["product_id"];
        } | null
      ];
    }[]
  | null;

export type ListBarcodeReturn = {
  [barcode: Product["barcodes"][number]]: {
    recordId: RecordView["id"];
    recordName: RecordView["name"];
    productId: RecordView["product_id"];
  };
};

const listBarcodes = async (inventory_id: number) => {
  const res = await supabase
    .from("product")
    .select("barcodes, record_view(id, name, product_id)")
    .eq("record_view.inventory_id", inventory_id);

  const data = res.data as ListBarcodePostgrestRes;
  if (!data) return null;

  const reducedData = data.reduce((result, item) => {
    const barcodes = item.barcodes;
    const recordId = item.record_view?.[0]?.id;
    const recordName = item.record_view?.[0]?.name;
    const productId = item.record_view?.[0]?.product_id;
    if (!recordId || !recordName || !productId) return result;
    barcodes.forEach((barcode) => {
      result[barcode] = { recordId, recordName, productId };
    });
    return result;
  }, {} as ListBarcodeReturn);

  if (isEmpty(reducedData)) return null;

  return {
    ...res,
    data: reducedData,
  };
};

export const useListBarcodes = (inventoryId: number) => {
  const query = useQuery(
    ["listBarcodes", inventoryId],
    async () => await listBarcodes(inventoryId)
  );
  return { ...query, data: query.data?.data as ListBarcodeReturn | null };
};
