import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

const listProductsCategorized = async () => {
  const response = await supabase
    .from("product_category")
    .select(
      `
      name, display_order,
      existing_products (
        id, name, display_order, unit
      )
      `
    )
    .order("display_order", { ascending: true });

  if (response.error) {
    console.log(response.error.message);
    return null;
  }

  return {
    ...response,
    data: response.data || [],
  };
  // return response;
};

export const useListProductsCategorized = () => {
  const query = useQuery(
    ["listProductsCategorized"],
    async () => await listProductsCategorized()
  );
  return { ...query, data: query.data?.data || [] };
};
