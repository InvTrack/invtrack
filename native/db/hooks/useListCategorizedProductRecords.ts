import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { ProductRecordView } from "../types";

type ProductRecordViewNonNullCategoryName =
  | {
      [K in keyof Omit<ProductRecordView, "barcode">]: K extends "category_name"
        ? NonNullable<ProductRecordView[K]>
        : ProductRecordView[K];
    }
  | null;

type ListCategorizedProductRecords = {
  title: string;
  data: ProductRecordViewNonNullCategoryName[];
}[];

const listCategorizedProductRecords = async (
  inventoryId: number
): Promise<ListCategorizedProductRecords | null> => {
  const response = await supabase
    .from("record_view")
    .select(
      `id, inventory_id, product_id, name, 
       quantity, unit, steps, category_name, 
       category_name, display_order, category_display_order
      `
    )
    .eq("inventory_id", inventoryId)
    .neq("category_name", null)
    .order("display_order", { ascending: true });

  if (response.error) {
    console.log(response.error.message);
    return null;
  }
  // maybe a use case for worklets? :D
  // https://github.com/software-mansion/react-native-reanimated/discussions/4968

  const mapped = response.data.reduce((acc, record) => {
    const title = record.category_name;
    if (!title) return acc;

    const indexMap = acc.reduce((map, category, index) => {
      if (category.title != null) {
        map[category.title] = index;
      }
      return map;
    }, {} as { [key: string]: number });

    if (title in indexMap) {
      acc[indexMap[title]].data!.push(
        record as ProductRecordViewNonNullCategoryName
      );
    } else {
      acc.push({
        title,
        data: [record as ProductRecordViewNonNullCategoryName],
      });
    }
    return acc;
  }, [] as ListCategorizedProductRecords);

  return mapped as ListCategorizedProductRecords;
};

export const useListCategorizedProductRecords = (inventoryId: number) =>
  useQuery(
    ["listCategorizedProductRecords", inventoryId],
    async () => await listCategorizedProductRecords(inventoryId)
  );
