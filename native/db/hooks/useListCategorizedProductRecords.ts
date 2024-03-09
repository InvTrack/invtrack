import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { RecordView } from "../types";

type RecordViewNonNullCategoryName =
  | {
      [K in keyof Omit<RecordView, "barcode">]: K extends "category_name"
        ? NonNullable<RecordView[K]>
        : RecordView[K];
    }
  | undefined;

type ListCategorizedProductRecords = {
  title: string;
  data: RecordViewNonNullCategoryName[] | undefined;
}[];

const listCategorizedProductRecords = async (
  inventoryId: number
): Promise<ListCategorizedProductRecords | undefined> => {
  const response = await supabase
    .from("record_view")
    .select(
      `id, inventory_id, product_id, name, 
       quantity, unit, steps, category_name, 
       category_name, display_order, category_display_order
      `
    )
    .eq("inventory_id", inventoryId)
    .neq("category_name", null);

  if (response.error) {
    console.log(response.error.message);
    return undefined;
  }
  const mapped = response.data.reduce((acc, record) => {
    const title = record.category_name;
    if (!title) return acc;
    const index = acc.findIndex((category) => category.title === title);
    if (index === -1) {
      acc.push({ title, data: [record as RecordViewNonNullCategoryName] });
    } else {
      acc[index].data!.push(record as RecordViewNonNullCategoryName);
    }
    return acc;
  }, [] as ListCategorizedProductRecords);
  // console.log(JSON.stringify(mapped, null, 2));
  return mapped as ListCategorizedProductRecords;
};

export const useListCategorizedProductRecords = (inventoryId: number) =>
  useQuery(["listCategorizedProductRecords", inventoryId], () =>
    listCategorizedProductRecords(inventoryId)
  );
