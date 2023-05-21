import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { RecordViewTable } from "../types";

export const useListRecords = (inventoryId: string) =>
  useQuery(["recordsList", inventoryId], async () => {
    const { data, error } = await supabase
      .from<"record_view", RecordViewTable>("record_view")
      .select()
      .eq("inventory_id", inventoryId);
    if (error) throw new Error(error.message);
    return data;
  });
