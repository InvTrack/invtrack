import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { SessionContext } from "./sessionContext";

const listInventories = async () => {
  const res = await supabase
    .from<"inventory", InventoryTable>("inventory")
    .select();
  return {
    ...res,
    data: res.data as Inventory[],
  };
};

export const useListInventories = () => {
  const { session } = useContext(SessionContext);
  const query = useQuery(
    ["inventories", session?.user.id],
    () => session && listInventories()
  );
  return { ...query, data: query.data?.data };
};
