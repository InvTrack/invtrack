import { useContext } from "react";
import { useMutation } from "react-query";
import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { SessionContext } from "./sessionContext";

export const useCreateInventory = () => {
  const { companyId } = useContext(SessionContext);

  return useMutation(
    async (inventory: Omit<Inventory, "created_at" | "company_id" | "id">) => {
      const { data, error } = await supabase
        .from<"inventory", InventoryTable>("inventory")
        .insert({ ...inventory, company_id: companyId });
      if (error) throw new Error(error.message);
      return data;
    }
  );
};
