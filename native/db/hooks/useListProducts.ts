import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";
import { Product, ProductTable } from "../types";
import { useSession } from "./sessionContext";

const listProducts = async () => {
  const res = await supabase.from<"product", ProductTable>("product").select();

  return {
    ...res,
    data: res.data as Product[],
  };
};

export const useListProducts = () => {
  const { session } = useSession();
  const query = useQuery(
    ["products", session?.user.id],
    () => session && listProducts()
  );
  return { ...query, data: query.data?.data };
};
