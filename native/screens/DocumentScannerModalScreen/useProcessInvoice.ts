import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { supabase } from "../../db/supabase";
import { ProcessInvoiceResponse } from "../../db/types";
import { useDocumentScannerContext } from "./DocumentScannerContext";

export const useProcessInvoice = (stockId: number) => {
  const { showError } = useSnackbar();

  const { updateDocumentScannerState } = useDocumentScannerContext();

  return useMutation(
    async ({
      base64Photo,
    }: {
      base64Photo: string;
      inventory_id: number | null;
    }): Promise<ProcessInvoiceResponse> => {
      const reqBody = {
        inventory_id: stockId,
        image: {
          data: base64Photo,
        },
      };

      const { data, error } = await supabase.functions.invoke(
        "process-invoice",
        {
          body: reqBody,
        }
      );
      if (error) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log(error);
        return null;
      }

      updateDocumentScannerState((d) => {
        d.processedInvoice = data;
      });

      return data as ProcessInvoiceResponse;
    }
  );
};
