import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { RecordView } from "../types";

type RecordViewNullCategoryName =
  | {
      [K in keyof Omit<RecordView, "barcode">]: K extends "category_name"
        ? null
        : RecordView[K];
    }
  | undefined;

const listUncategorizedProductRecords = async (
  inventoryId: number
): Promise<RecordViewNullCategoryName[]> => {
  const response = await supabase
    .from("record_view")
    .select(
      "id, inventory_id, product_id, name, quantity, unit, steps, category_name, display_order, category_display_order"
    )
    .eq("inventory_id", inventoryId)
    .is("category_name", null)
    .order("display_order", { ascending: true });

  if (response.error) {
    console.log(response.error.message);
  }

  return response.data as RecordViewNullCategoryName[];
};

export const useListUncategorizedProductRecords = (inventoryId: number) =>
  useQuery(["listUncategorizedProductRecords", inventoryId], () =>
    listUncategorizedProductRecords(inventoryId)
  );
