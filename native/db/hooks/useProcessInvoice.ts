import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase";

export const useProcessInvoice = () =>
  useMutation(["processInvoice"], async (base64Photo: string) => {
    const { data, error } = await supabase.functions.invoke("scan-doc", {
      body: {
        image: {
          data: base64Photo,
        },
      },
    });
    if (error) {
      console.log(error);
      return null;
    }
    return data;
  });
