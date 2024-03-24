import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { useSession } from "./sessionContext";

const listExistingProducts = async () => {
  const res = await supabase.from("existing_products").select();

  return {
    ...res,
    data: res.data || [],
  };
};

// function entirely unused currently, consider deletion?
export const useListExistingProducts = () => {
  const { session } = useSession();
  const query = useQuery(
    ["products", session?.user.id],
    () => session && listExistingProducts()
  );
  return { ...query, data: query.data?.data };
};
