import { supabase } from "./supabase";

export const fetchProducts = async (userId: string) => {
  const res = await supabase
    .from("user")
    .select(`*, product(*)`)
    .eq("id", userId)
    .single();
  return { ...res, data: res?.data?.product };
};

export const fetchInventories = async (userId: string) => {
  const res = await supabase
    .from("user")
    .select(`*, inventory(*)`)
    .eq("id", userId)
    .single();
  return { ...res, data: res?.data?.inventory };
};

export const fetchUser = async (userId: string) => {
  const res = await supabase
    .from("user")
    .select(`username, company_name`)
    .eq("id", userId)
    .single();
  return res;
};
