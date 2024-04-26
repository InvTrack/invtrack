import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "../auth";
import { supabase } from "../supabase";
import { InventoryInsert } from "../types";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";

export const useCreateInventory = () => {
  const { session } = useSession();
  const { data: companyId } = useGetCurrentCompanyId();
  const queryClient = useQueryClient();
  return useMutation(
    async (inventory: InventoryInsert) => {
      const { data, error } = await supabase
        .from("inventory")
        .insert({ ...inventory, company_id: companyId?.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onMutate: async (inventory: InventoryInsert) => {
        await queryClient.cancelQueries(["inventories", session?.user.id]);
        queryClient.setQueryData(
          ["inventories", session?.user.id],
          (old: any) => {
            return { ...old, data: [{ ...old.data, inventory }] };
          }
        );
      },
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ["inventories", session?.user.id],
          exact: true,
          refetchType: "all",
        }),
    }
  );
};
