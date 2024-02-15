import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { supabase } from "../supabase";
import { BarcodeList } from "./useListBarcodes";

type InsertBarcodeParams = {
  new_barcode: string;
  product_id: number;
};

const insertBarcode = async ({
  new_barcode,
  product_id,
}: InsertBarcodeParams) => {
  const { data, error } = await supabase.rpc("insert_barcode", {
    new_barcode,
    product_id,
  });

  if (error) {
    Alert.alert(
      "Błąd",
      "Nie udało się dodać kodu kreskowego. Może jest już przypisany do innego produktu?"
    );
    return;
  }
  return data;
};

export const useInsertBarcode = (inventory_id: number) => {
  const queryClient = useQueryClient();

  return useMutation(insertBarcode, {
    onMutate: async ({ new_barcode, product_id }) => {
      await queryClient.cancelQueries(["barcodeList", inventory_id]);
      const previousBarcodesList = queryClient.getQueryData<BarcodeList>([
        "barcodeList",
        inventory_id,
      ]);

      queryClient.setQueryData<BarcodeList>(
        ["barcodeList", inventory_id],
        (old) => {
          console.log(old);
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
  });
};
