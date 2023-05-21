import { useContext } from "react";
import { Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { UserTable } from "../types";
import { SessionContext } from "./sessionContext";

export const useGetUser = () => {
  const { session } = useContext(SessionContext);
  return useQuery(["user", session?.user.id], async () => {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from<"user", UserTable>("user")
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
  });
};
