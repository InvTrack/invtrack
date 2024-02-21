import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { supabase } from "../supabase";
import { useGetCurrentCompanyId } from "./useGetCurrentCompanyId";
import { BarcodeList } from "./useListBarcodes";

type InsertBarcodeParams = {
  new_barcode: string;
  product_id: number;
  company_id: number | null | undefined;
};

const insertBarcode = async ({
  new_barcode,
  product_id,
  company_id,
}: InsertBarcodeParams) => {
  if (!company_id) {
    Alert.alert("Błąd", "Nie udało się dodać kodu kreskowego.");
    return { code: null, product_id: null };
  }

  const { data, error } = await supabase
    .from("barcode")
    .insert({
      code: new_barcode,
      product_id,
      company_id,
    })
    .select("code, product_id")
    .single();

  if (error) {
    console.error(error);
    Alert.alert(
      "Błąd",
      "Nie udało się dodać kodu kreskowego. Może jest już przypisany do innego produktu?"
    );
    return { code: null, product_id: null };
  }
  return data;
};

export const useInsertBarcode = (inventory_id: number) => {
  const queryClient = useQueryClient();
  const { data: companyIdData } = useGetCurrentCompanyId();

  return useMutation(
    ({ new_barcode, product_id }: Omit<InsertBarcodeParams, "company_id">) =>
      insertBarcode({
        new_barcode,
        product_id,
        company_id: companyIdData?.id,
      }),
    {
      onMutate: async ({ new_barcode, product_id }) => {
        await queryClient.cancelQueries(["barcodeList", inventory_id]);
        const previousBarcodesList = queryClient.getQueryData<BarcodeList>([
          "barcodeList",
          inventory_id,
        ]);

        queryClient.setQueryData<BarcodeList>(
          ["barcodeList", inventory_id],
          (old) => {
            if (!old) return;
            return { ...old, [new_barcode]: product_id };
          }
        );
        return { previousBarcodesList };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousBarcodesList) {
          queryClient.setQueryData<BarcodeList>(
            ["barcodeList"],
            context.previousBarcodesList
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(["barcodeList", inventory_id]);
      },
    }
  );
};
