import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { RecordViewTable } from "../types";

const getRecord = async (context: QueryFunctionContext<[string, number]>) => {
  const [, recordId] = context.queryKey;
  const { data, error } = await supabase
    .from<"record_view", RecordViewTable>("record_view")
    .select()
    .eq("id", recordId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const useGetRecord = (recordId: number) => {
  const query = useQuery({
    queryKey: ["product_record", recordId],
    queryFn: getRecord,
  });
  return query;
};
