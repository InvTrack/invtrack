import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";

import { useSnackbar } from "../../components/Snackbar/context";
import { supabase } from "../supabase";
import { SessionContext } from "./sessionContext";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { session } = useContext(SessionContext);
  const { showError } = useSnackbar();
  return useMutation(
    async ({
      username,
      companyName,
    }: {
      username: string;
      companyName: string;
    }) => {
      try {
        if (!session?.user) {
          showError("Nie jesteś zalogowany");
        }

        const updates = {
          id: session?.user.id,
          username,
          company_name: companyName,
          updated_at: new Date(),
        };

        const { error } = await supabase.from("user").upsert(updates);

        if (error) {
          showError("Nieznany błąd, spróbuj ponownie");
        }
      } catch (error) {
        showError("Nieznany błąd, spróbuj ponownie");
      }
    },
    { onSuccess: () => queryClient.invalidateQueries(["user"]) }
  );
};
