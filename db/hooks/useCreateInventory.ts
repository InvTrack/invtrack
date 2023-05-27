import { useMutation } from "react-query";
import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";

export const useCreateInventory = () => {
  const companyIdResult = useGetCurrentCompanyId();
  return useMutation(
    async (inventory: Omit<Inventory, "created_at" | "company_id" | "id">) => {
      if (companyIdResult.isSuccess) {
        const { data, error } = await supabase
          .from<"inventory", InventoryTable>("inventory")
          .insert({ ...inventory, company_id: companyIdResult.data.id });
        if (error) throw new Error(error.message);
        return data;
      }
      return null;
    },
    {}
  );
};
