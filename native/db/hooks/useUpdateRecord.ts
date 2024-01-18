import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { Record, RecordTable } from "../types";
const updateRecord = async (record: Partial<Record>, recordId: number) => {
  const { data, error } = await supabase
    .from<"product_record", RecordTable>("product_record")
    .update(record)
    .eq("id", recordId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
export const useUpdateRecord = (recordId: number) => {
  const queryClient = useQueryClient();
  return useMutation((record) => updateRecord(record, recordId), {
    onMutate: async (record: Partial<Record>) => {
      await queryClient.cancelQueries(["product_record", recordId]);
      const previousRecord = queryClient.getQueryData<Record>([
        "product_record",
        recordId,
      ]);
      if (previousRecord?.quantity) {
        queryClient.setQueryData(["product_record", recordId], {
          ...previousRecord,
          ...record,
        });
      }
      return { previousRecord };
    },
    onSettled: () =>
      queryClient.invalidateQueries(["product_record", recordId]),
  });
};
