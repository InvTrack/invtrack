import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { supabase } from "../supabase";
import { ProcessSalesRaportResponse } from "../types";

export const useProcessSalesRaport = () => {
  const { showError } = useSnackbar();

  const inventory_id = useAppSelector(
    documentScannerSelector.selectInventoryId
  );

  return useMutation(
    async ({
      base64Photo,
    }: {
      base64Photo: string;
      inventory_id: number | null;
    }): Promise<ProcessSalesRaportResponse> => {
      if (inventory_id == null) {
        showError("Nie udało się przetworzyć zdjęcia");
        console.log(
          "useProcessSalesRaport - no inventory_id, this should not happen"
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

      return data as ProcessSalesRaportResponse;
    }
  );
};
