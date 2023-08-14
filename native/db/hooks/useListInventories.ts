import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { Inventory, InventoryTable } from "../types";
import { useSession } from "./sessionContext";

const listInventories = async () => {
  const res = await supabase
    .from<"inventory", InventoryTable>("inventory")
    .select()
    .order("created_at", { ascending: false });

  return {
    ...res,
    data: res.data as Inventory[],
  };
};

export const useListInventories = () => {
  const { session } = useSession();
  const query = useQuery(
    ["inventories", session?.user.id],
    () => session && listInventories()
  );
  return { ...query, data: query.data?.data };
};
