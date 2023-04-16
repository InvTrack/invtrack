import { useContext } from "react";
import { useMutation } from "react-query";
import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { SessionContext } from "./sessionContext";

export const useCreateInventory = () => {
  const { session } = useContext(SessionContext);
  const user_id = session?.user.id || "";

  return useMutation(
    async (inventory: Omit<Inventory, "created_at" | "user_id" | "id">) => {
      const { data, error } = await supabase
        .from<"inventory", InventoryTable>("inventory")
        .insert({ ...inventory, user_id });
      if (error) throw new Error(error.message);
      return data;
    }
  );
};
