import { useQuery } from "react-query";
import { supabase } from "../supabase";
import { RecordViewTable } from "../types";

export const useGetRecord = (recordId: string) =>
  useQuery(["product_record", recordId], async () => {
    const { data, error } = await supabase
      .from<"record_view", RecordViewTable>("record_view")
      .select()
      .eq("id", recordId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  });
