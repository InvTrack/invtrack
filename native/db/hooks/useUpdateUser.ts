import { useContext } from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { SessionContext } from "../auth";
import { supabase } from "../supabase";

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
