import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { InventoryInsert } from "../types";
import { useSession } from "./sessionContext";

export const useCreateInventory = () => {
  const { companyId, session } = useSession();
  const queryClient = useQueryClient();
  return useMutation(
    async (inventory: InventoryInsert) => {
      const { data, error } = await supabase
        .from("inventory")
        .insert({ ...inventory, company_id: companyId })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onSuccess: () =>
        queryClient.invalidateQueries(["inventories", session?.user.id]),
    }
  );
};
