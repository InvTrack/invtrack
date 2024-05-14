import { useQuery } from "@tanstack/react-query";

import { useListRecipeRecords } from "./useListRecipeRecords";

export const useGetRecipeRecord = (
  inventoryId: number,
  recipeRecordId: number
) => {
  const { data: recipeRecordList, isSuccess: isListRecipeRecordsSuccess } =
    useListRecipeRecords(inventoryId);

  return useQuery(
    ["recipeRecord", recipeRecordId],
    () => recipeRecordList?.find((rr) => rr.id === recipeRecordId),
    {
      enabled: isListRecipeRecordsSuccess,
      staleTime: 1000 * 10,
      cacheTime: 1000 * 30,
    }
  );
};
