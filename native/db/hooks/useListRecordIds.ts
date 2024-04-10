import { useMemo } from "react";
import { useListCategorizedProductRecords } from "./useListCategorizedProductRecords";
import { useListUncategorizedProductRecords } from "./useListUncategorizedProductRecords";

const getIds = (
  uncategorizedRecordList: ReturnType<
    typeof useListUncategorizedProductRecords
  >["data"],
  categorizedRecordList: ReturnType<
    typeof useListCategorizedProductRecords
  >["data"]
) =>
  [
    ...(uncategorizedRecordList?.map(
      (uncategorizedRecord) => uncategorizedRecord?.id
    ) || []),
    ...(categorizedRecordList?.flatMap((category) =>
      category.data.map((record) => record?.id)
    ) || []),
  ].filter((id) => id != null) as number[];

export const useListRecordIds = (inventoryId: number): { data: number[] } => {
  const { data: uncategorizedRecordList } =
    useListUncategorizedProductRecords(inventoryId);
  const { data: categorizedRecordList } =
    useListCategorizedProductRecords(inventoryId);
  const ids = useMemo(
    () => getIds(uncategorizedRecordList, categorizedRecordList),
    [uncategorizedRecordList, categorizedRecordList]
  );
  return {
    data: ids,
  };
};
