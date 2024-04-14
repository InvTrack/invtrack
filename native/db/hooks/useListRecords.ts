import { useMemo } from "react";
import { useListCategorizedProductRecords } from "./useListCategorizedProductRecords";
import { useListUncategorizedProductRecords } from "./useListUncategorizedProductRecords";

type GetRecords = (
  | NonNullable<
      NonNullable<
        ReturnType<typeof useListUncategorizedProductRecords>["data"]
      >[number]
    >
  | NonNullable<
      NonNullable<
        ReturnType<typeof useListCategorizedProductRecords>["data"]
      >[number]["data"][number]
    >
)[];
const getRecords = (
  uncategorizedRecordList: ReturnType<
    typeof useListUncategorizedProductRecords
  >["data"],
  categorizedRecordList: ReturnType<
    typeof useListCategorizedProductRecords
  >["data"]
) =>
  [
    ...(uncategorizedRecordList || []),
    ...(categorizedRecordList?.flatMap((category) => category.data) || []),
  ].filter((r) => r?.id != null || r?.product_id != null) as GetRecords;

export const useListRecords = (
  inventoryId: number
): {
  data: GetRecords;
} => {
  const { data: uncategorizedRecordList } =
    useListUncategorizedProductRecords(inventoryId);
  const { data: categorizedRecordList } =
    useListCategorizedProductRecords(inventoryId);
  const ids = useMemo(
    () => getRecords(uncategorizedRecordList, categorizedRecordList),
    [inventoryId, uncategorizedRecordList, categorizedRecordList]
  );
  return {
    data: ids,
  };
};
