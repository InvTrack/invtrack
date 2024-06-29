import { useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase";

const listExistingProducts = async () => {
  const res = await supabase.from("existing_products").select();

  return {
    ...res,
    data: res.data || [],
  };
};

export const useListExistingProducts = () => {
  const query = useQuery(["existingProducts"], () => listExistingProducts());
  return { ...query, data: query.data?.data };
};
