import { useContext } from "react";
import { useQuery } from "react-query";
import { supabase } from "../supabase";
import { CompanyTable, Inventory, InventoryTable } from "../types";
import { SessionContext } from "./sessionContext";

const listInventories = async (userId: string, companyId: number) => {
  const res = await supabase
    .from<"inventory", InventoryTable>("inventory")
    .select();
  return {
    ...res,
    data: res.data as Inventory[],
  };
};

export const useListInventories = () => {
  const { session, companyId } = useContext(SessionContext);
  const query = useQuery(
    ["inventories", session?.user.id],
    () => session && listInventories(session?.user.id, companyId)
  );
  return { ...query, data: query.data?.data };
};
