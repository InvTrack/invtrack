import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../components/Snackbar/hooks";
import { documentScannerAction } from "../../redux/documentScannerSlice";
import { useAppDispatch } from "../../redux/hooks";
import { supabase } from "../supabase";
import { ProcessSalesRaportResponse } from "../types";
import { queryKeys } from "./queryKeys";

export const useProcessSalesRaport = (inventory_id: number | null) => {
  const { showError } = useSnackbar();
  const dispatch = useAppDispatch();

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

      dispatch(
        documentScannerAction.SET_PROCESSED_SALES_RAPORT({
          processedSalesRaport: data,
        })
      );

      return data as ProcessSalesRaportResponse;
    },
    {
      mutationKey: queryKeys.processSalesRaport(inventory_id),
    }
  );
};
