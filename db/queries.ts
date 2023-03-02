import { supabase } from "./supabase";
import { Database } from "./types";

export const getUser = async (userId: string) => {
  const res = await fromUserTable
    .select(`username, company_name`)
    .eq("id", userId)
    .single();
  return res;
};

const fromUserTable = supabase.from<
  "user",
  Database["public"]["Tables"]["user"]
>("user");

export const listProducts = async (userId: string) => {
  const res = await fromUserTable
    .select(`*, product(*)`)
    .eq("id", userId)
    .single();
  return {
    ...res,
    data: res.data?.product as Database["public"]["Tables"]["product"]["Row"][],
  };
};

export const listInventories = async (userId: string) => {
  const res = await fromUserTable
    .select(`*, inventory(*)`)
    .eq("id", userId)
    .single();
  return {
    ...res,
    data: res.data
      ?.inventory as Database["public"]["Tables"]["inventory"]["Row"][],
  };
};

export const listProductQuantities = async (inventoryId: string) => {
  const res = await supabase
    .from<"inventory", Database["public"]["Tables"]["inventory"]>("inventory")
    .select(`*, product_quantity(*)`)
    .eq("id", inventoryId)
    .single();
  return {
    ...res,
    data: res.data
      ?.product_quantity as Database["public"]["Tables"]["product_quantity"]["Row"][],
  };
};
