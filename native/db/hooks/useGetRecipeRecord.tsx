import { useQuery } from "@tanstack/react-query";

import { useListRecipeRecords } from "./useListRecipeRecords";

export const useGetRecipeRecord = (
  inventoryId: number,
  recipeRecordId: number | null | undefined
) => {
  const { data: recipeRecordList, isSuccess: isListRecipeRecordsSuccess } =
    useListRecipeRecords(inventoryId);

  return useQuery(
    ["recipeRecord", recipeRecordId],
    () => {
      if (recipeRecordId == null)
        throw new Error(
          "useGetRecipeRecord - recipeRecordId should be defined"
        );
      return recipeRecordList?.find((rr) => rr.id === recipeRecordId);
    },
    {
      enabled: isListRecipeRecordsSuccess,
      staleTime: 1000 * 10,
      cacheTime: 1000 * 30,
    }
  );
};
