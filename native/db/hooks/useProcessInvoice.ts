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
    throw new Error(
      "useProcessInvoice must be used within a DocumentScannerContext"
    );
  }
  const { dispatch } = documentScannerContext;

  return useMutation(
    ["processInvoice"],
    async (base64Photo: string): Promise<ProcessedInvoice | null> => {
      const { data, error } = await supabase.functions.invoke("scan-doc", {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
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
    }
  );
};
