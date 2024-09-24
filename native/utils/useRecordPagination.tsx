import { useMemo } from "react";
import { useListProductRecords } from "../db";

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

type LocalRecordType = {
  id: number;
  product_id: number;
};

export const useRecordPagination = (
  inventoryId: number,
  recordId: number | undefined
): {
  nextRecord: LocalRecordType | undefined;
  prevRecord: LocalRecordType | undefined;
  isLast: boolean;
  isFirst: boolean;
} => {
  const { data: records } = useListProductRecords(inventoryId);
  const recordIds = useMemo(() => getIds(records), [inventoryId, records]);
  if (!recordIds || recordIds.length === 0) {
    return {
      nextRecord: undefined,
      prevRecord: undefined,
      isLast: false,
      isFirst: false,
    };
  }

  const index = recordIds.findIndex((r) => r.id === recordId);
  const isLast = index === recordIds.length - 1;
  const isFirst = index === 0;

  const nextRecord = isLast ? undefined : recordIds[index + 1];
  const prevRecord = isFirst ? undefined : recordIds[index - 1];

  return {
    nextRecord,
    prevRecord,
    isLast,
    isFirst,
  };
};
