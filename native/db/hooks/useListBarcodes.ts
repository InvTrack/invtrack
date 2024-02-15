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
        } | null
      ];
    }[]
  | null;

export type BarcodeList = {
  [barcode: Product["barcodes"][number]]: RecordView["id"];
};

const barcodeList = async (inventory_id: number) => {
  const res = await supabase
    .from("product")
    .select("barcodes, record_view(id, name, product_id)")
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
  }, {} as BarcodeList);

  if (isEmpty(reducedData)) return null;

  return reducedData;
};

export const useListBarcodes = (inventoryId: number) =>
  useQuery(
    ["barcodeList", inventoryId],
    async () => await barcodeList(inventoryId)
  );
