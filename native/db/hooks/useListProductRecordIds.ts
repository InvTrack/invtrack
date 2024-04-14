import { useMemo } from "react";
import { useListProductRecords } from "./useListProductRecords";

const getIds = (
  uncategorizedRecordList: ReturnType<typeof useListProductRecords>["data"]
) =>
  [
    ...(uncategorizedRecordList?.map((uncategorizedRecord) => ({
      id: uncategorizedRecord?.id,
      product_id: uncategorizedRecord?.product_id,
    })) || []),
  ] as {
    id: number;
    product_id: number;
  }[];

export const useListProductRecordIds = (
  inventoryId: number
): {
  data: {
    id: number;
    product_id: number;
  }[];
} => {
  const { data: records } = useListProductRecords(inventoryId);
  const ids = useMemo(() => getIds(records), [inventoryId, records]);
  return {
    data: ids,
  };
};
