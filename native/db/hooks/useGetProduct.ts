import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

export type UseGetProductQueryKey = ["product", productId: number];

const getProduct = async (productId: number) => {
  const { data, error } = await supabase
    .from("product")
    .select()
    .eq("id", productId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const useGetProduct = (productId: number) => {
  const query = useQuery(["product", productId], () => getProduct(productId));
  return query;
};
