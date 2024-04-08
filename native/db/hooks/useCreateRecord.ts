import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { ProductRecordInsert } from "../types";
import { useSession } from "./sessionContext";

export const useCreateRecord = () => {
  const { companyId } = useSession();
  const queryClient = useQueryClient();
  return useMutation(
    async (record: ProductRecordInsert) => {
      const { data, error } = await supabase
        .from("product_record")
        .insert({ ...record, company_id: companyId })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      // onMutate: async (record: ProductRecordInsert) => {
      // await queryClient.cancelQueries(["recordsList", record.inventory_id]);
      // queryClient.setQueryData(
      //   ["recordsList", record.inventory_id],
      //   (old: any) => {
      //     return { ...old, data: [{ ...old.data, record }] };
      //   }
      // );
      // },
      onSuccess: (record) =>
        queryClient.invalidateQueries({
          queryKey: ["recordsList", record.inventory_id],
          exact: true,
          refetchType: "all",
        }),
    }
  );
};
