import { useContext } from "react";
import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getUser,
  listInventories,
  listProductQuantities,
  listProducts,
} from "./queries";
import { SessionContext } from "./sessionContext";
import { supabase } from "./supabase";

export const useGetUser = () => {
  const { session } = useContext(SessionContext);
  return useQuery(["user", session?.user.id], async () => {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await getUser(session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { session } = useContext(SessionContext);
  return useMutation(
    async ({
      username,
      companyName,
    }: {
      username: string;
      companyName: string;
    }) => {
      try {
        if (!session?.user) throw new Error("No user on the session!");

        const updates = {
          id: session?.user.id,
          username,
          company_name: companyName,
          updated_at: new Date(),
        };

        const { error } = await supabase.from("user").upsert(updates);

        if (error) {
          throw error;
        }
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    },
    { onSuccess: () => queryClient.invalidateQueries("user") }
  );
};

export const useListInventories = () => {
  const { session } = useContext(SessionContext);
  const query = useQuery(
    ["inventories", session?.user.id],
    () => session && listInventories(session?.user.id)
  );
  return { ...query, data: query.data?.data };
};

export const useListProducts = () => {
  const { session } = useContext(SessionContext);
  const query = useQuery(
    ["products", session?.user.id],
    () => session && listProducts(session?.user.id)
  );
  return { ...query, data: query.data?.data };
};

export const useListProductQuantities = (inventoryId: string) => {
  const query = useQuery(["product_quantities", inventoryId], () =>
    listProductQuantities(inventoryId)
  );
  return { ...query, data: query.data?.data };
};
