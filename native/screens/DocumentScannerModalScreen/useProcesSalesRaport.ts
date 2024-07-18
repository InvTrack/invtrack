import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { queryKeys } from "../../db/hooks/queryKeys";
import { supabase } from "../../db/supabase";
import { ProcessSalesRaportResponse } from "../../db/types";
import { useDocumentScannerContext } from "./DocumentScannerContext";

export const useProcessSalesRaport = (inventory_id: number | null) => {
  const { showError } = useSnackbar();

  const { updateDocumentScannerState } = useDocumentScannerContext();

  return useMutation(
    async ({
      base64Photo,
    }: {
      base64Photo: string;
    }): Promise<ProcessSalesRaportResponse> => {
      if (inventory_id == null) {
        console.error(
          "useProcessSalesRaport - no inventory_id, this should not happen"
        );
        showError("Nie udało się przetworzyć zdjęcia - zrestartuj aplikację");
        return null;
      }
      const reqBody = {
        inventory_id,
        image: {
          data: base64Photo,
        },
      };

      const { data, error } = await supabase.functions.invoke(
        "process-sales-raport",
        {
          body: reqBody,
        }
      );
      if (error) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log("useProcessSalesRaport", error);
        return null;
      }

      updateDocumentScannerState((d) => {
        d.processedSalesReport = data;
      });

      return data as ProcessSalesRaportResponse;
    },
    {
      mutationKey: queryKeys.processSalesRaport(inventory_id),
    }
  );
};
