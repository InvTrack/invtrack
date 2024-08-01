import { useListProductRecordIds } from "../db/hooks/useListProductRecordIds";

type LocalRecordType = ReturnType<
  typeof useListProductRecordIds
>["data"][number];

export const useRecordPagination = (
  recordId: number | undefined,
  records: LocalRecordType[]
): {
  nextRecord: LocalRecordType | undefined;
  prevRecord: LocalRecordType | undefined;
  isLast: boolean;
  isFirst: boolean;
} => {
  if (!records || records.length === 0) {
    return {
      nextRecord: undefined,
      prevRecord: undefined,
      isLast: false,
      isFirst: false,
    };
  }

  const index = records.findIndex((r) => r.id === recordId);
  const isLast = index === records.length - 1;
  const isFirst = index === 0;

  const nextRecord = isLast ? undefined : records[index + 1];
  const prevRecord = isFirst ? undefined : records[index - 1];

  return {
    nextRecord,
    prevRecord,
    isLast,
    isFirst,
  };
};
