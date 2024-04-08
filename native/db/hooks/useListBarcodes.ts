import { useQuery } from "@tanstack/react-query";

import isEmpty from "lodash/isEmpty";
import { supabase } from "../supabase";
import { ProductRecordView } from "../types";

export type BarcodeList = {
  [barcode: string]: ProductRecordView["id"];
};

const barcodeList = async (inventory_id: number) => {
  const res = await supabase
    .from("record_view")
    .select("id, barcode")
    .eq("inventory_id", inventory_id);

  const data = res.data;
  if (!data) return null;

  const transformedData = data.reduce((result, item) => {
    if (!item.id || !item.barcode) return result;

    const barcode: string = item.barcode as string;
    if (barcode) {
      result[barcode] = item.id;
    }
    return result;
  }, {} as BarcodeList);

  if (isEmpty(transformedData)) return null;

  return transformedData;
};

export const useListBarcodes = (inventoryId: number) =>
  useQuery(
    ["barcodeList", inventoryId],
    async () => await barcodeList(inventoryId)
  );
