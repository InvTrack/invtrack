import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
import {
  documentScannerAction,
  documentScannerSelector,
} from "../../redux/documentScannerSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { supabase } from "../supabase";
import { ScanDocResponse } from "../types";

export const useProcessInvoice = () => {
  const { showError } = useSnackbar();

  const inventory_id = useAppSelector(
    documentScannerSelector.selectInventoryId
  );
  const dispatch = useAppDispatch();

  return useMutation(
    async ({
      base64Photo,
    }: {
      base64Photo: string;
      inventory_id: number | null;
    }): Promise<ScanDocResponse> => {
      if (inventory_id == null) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log(
          "useProcessInvoice - no inventory_id, this should not happen"
        );
        return null;
      }
      const reqBody = {
        inventory_id,
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

      dispatch(
        documentScannerAction.INVOICE_PROCESSING_RESULT({
          processedInvoice: data,
        })
      );

      return data as ScanDocResponse;
    }
  );
};
