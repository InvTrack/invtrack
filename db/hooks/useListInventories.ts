import { useContext } from "react";
import { useQuery } from "react-query";
import { supabase } from "../supabase";
import { Inventory, UserTable } from "../types";
import { SessionContext } from "./sessionContext";

const listInventories = async (userId: string) => {
  const res = await supabase
    .from<"user", UserTable>("user")
    .select(`*, inventory(*)`)
    .eq("id", userId)
    .single();
  return {
    ...res,
    data: res.data?.inventory as Inventory[],
  };
};

export const useListInventories = () => {
  const { session } = useContext(SessionContext);
  const query = useQuery(
    ["inventories", session?.user.id],
    () => session && listInventories(session?.user.id)
  );
  return { ...query, data: query.data?.data };
};
