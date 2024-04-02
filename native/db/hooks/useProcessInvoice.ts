import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import {
  DocumentScannerContext,
  ProcessedInvoice,
} from "../../components/DocumentScanner/DocumentScannerContext";
import { useSnackbar } from "../../components/Snackbar/context";
import { supabase } from "../supabase";

export const useProcessInvoice = () => {
  const { showError } = useSnackbar();

  const documentScannerContext = useContext(DocumentScannerContext);
  if (!documentScannerContext) {
    showError("Nie udało się przetworzyć zdjęcia");
    throw new Error(
      "useProcessInvoice must be used within a DocumentScannerContext"
    );
  }
  const {
    dispatch,
    state: { inventory_id },
  } = documentScannerContext;

  return useMutation({
    mutationFn: async ({
      base64Photo,
    }: {
      base64Photo: string;
      inventory_id: number | null;
    }): Promise<ProcessedInvoice | null> => {
      if (inventory_id == null) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log(
          "useProcessInvoice - no inventory_id, this should not happen"
        );
        return null;
      }
      const { data, error } = await supabase.functions.invoke("scan-doc", {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          inventory_id,
          image: {
            data: base64Photo,
          },
        },
      });
      if (error) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log(error);
        return null;
      }

      dispatch({
        type: "PROCESSED_INVOICE",
        payload: { processedInvoice: data },
      });

      return data as ProcessedInvoice;
    },
  });
};
