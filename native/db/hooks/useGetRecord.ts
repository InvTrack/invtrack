import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

export type UseGetRecordQueryKey = ["product_record", recordId: number];

const getRecord = async (recordId: number) => {
  const { data, error } = await supabase
    .from("record_view")
    .select()
    .eq("id", recordId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const useGetRecord = (recordId: number) => {
  const query = useQuery(["product_record", recordId], () =>
    getRecord(recordId)
  );
  return query;
};
