import { useListRecords } from "./useListRecords";

export const useListRecordIds = (inventoryId: number) => {
  const { data: recordList, ...rest } = useListRecords(inventoryId);
  return {
    data: recordList?.map((record) => record.id),
    ...rest,
  };
};
