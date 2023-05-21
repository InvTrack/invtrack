import { supabase } from "../supabase";
import { Record, RecordTable } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateRecord = (recordId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (record: Partial<Record>) => {
      const { data, error } = await supabase
        .from<"product_record", RecordTable>("product_record")
        .update(record)
        .eq("id", recordId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    {
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
    }
  );
};
