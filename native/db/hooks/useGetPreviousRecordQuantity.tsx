import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export const useGetPreviousRecordQuantity = (
  inventoryId: number,
  productId: number | undefined | null
) => {
  const query = useQuery(
    ["previousRecordQuantity", inventoryId, productId],
    async () =>
      await supabase.rpc("get_previous_product_record_quantity", {
        current_inventory_id: inventoryId,
        // we know this is defined, because of the enabled option
        current_product_id: productId!,
      }),
    { enabled: typeof productId === "number" }
  );
  return { ...query, data: query.data?.data ?? null };
};
