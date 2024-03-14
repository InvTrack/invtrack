import { useListProductRecords } from "./useListProductRecords";

export const useListRecordIds = (inventoryId: number) => {
  const { data: recordList, ...rest } = useListProductRecords(inventoryId);
  return {
    data: recordList?.map((record) => record.id),
    ...rest,
  };
};
