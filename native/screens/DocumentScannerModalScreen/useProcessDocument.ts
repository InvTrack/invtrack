import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
// import { queryKeys } from "../../db/hooks/queryKeys";
import { supabase } from "../../db/supabase";
import { ProcessSalesRaportResponse } from "../../db/types";
import { useDocumentScannerContext } from "./DocumentScannerContext";

export const useProcessDocument = (
  stockId: number | null,
  stockType: "delivery" | "inventory"
) => {
  const { showError } = useSnackbar();

  const { updateDocumentScannerState } = useDocumentScannerContext();

  return useMutation(
    async ({
      base64Photo,
    }: {
      base64Photo: string;
    }): Promise<ProcessSalesRaportResponse> => {
      if (stockId == null) {
        console.error(
          "useProcessDocument - no stockId, this should not happen"
        );
        showError("Nie udało się przetworzyć zdjęcia - zrestartuj aplikację");
        return null;
      }
      const reqBody = {
        inventory_id: stockId,
        image: {
          data: base64Photo,
        },
      };

      const functionName =
        stockType === "delivery" ? "process-invoice" : "process-sales-raport";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: reqBody,
      });
      if (error) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log("useProcessDocument", error);
        return null;
      }

      updateDocumentScannerState((d) => {
        if (stockType === "delivery") {
          d.processedInvoice = data;
        } else {
          d.processedSalesReport = data;
        }
      });

      return data as ProcessSalesRaportResponse;
    }
    // WIP
    // {
    //   mutationKey: queryKeys.processSalesRaport(stockId),
    // }
  );
};
