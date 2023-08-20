import { useQuery } from "@tanstack/react-query";

import { Alert } from "react-native";

import { supabase } from "../supabase";
// import { UserTable } from "../types";
import { useSession } from "../auth";

export const useGetUser = () => {
  const { session } = useSession();

  return useQuery(
    ["user", session?.user.id],
    async () => {
      try {
        if (!session?.user)
          return {
            username: null,
            company_name: null,
          };

        const { data, error, status } = await supabase
          .from("user")
          .select(`username, company_name`)
          .eq("id", session?.user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        return data;
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    },
    {
      enabled: !!session?.user.id,
    }
  );
};
