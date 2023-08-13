import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { useSession } from "./sessionContext";

export const useCreateInventory = () => {
  const { companyId, session } = useSession();
  const queryClient = useQueryClient();
  return useMutation(
    async (inventory: Omit<Inventory, "created_at" | "company_id" | "id">) => {
      const { data, error } = await supabase
        .from<"inventory", InventoryTable>("inventory")
        .insert({ ...inventory, company_id: companyId })
        .select();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onSuccess: () =>
        queryClient.invalidateQueries(["inventories", session?.user.id]),
    }
  );
};
