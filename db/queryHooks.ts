import { useContext } from "react";
import { Alert } from "react-native";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchUser } from "./queries";
import { SessionContext } from "./sessionContext";
import { supabase } from "./supabase";

export const useGetUser = () => {
  const session = useContext(SessionContext);
  return useQuery(["user", session?.user.id], async () => {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await fetchUser(session?.user.id);

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
  const session = useContext(SessionContext);
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
