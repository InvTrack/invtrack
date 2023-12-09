import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { supabase } from "../supabase";

interface InsertBarcodeParams {
  new_barcode: string;
  product_id: number;
}

const insertBarcode = async ({
  new_barcode,
  product_id,
}: InsertBarcodeParams) => {
  const { data, error } = await supabase.rpc("insert_barcode", {
    new_barcode,
    product_id,
  });

  console.log("useUpdateBarcode", data, error);

  if (error) {
    Alert.alert("Błąd", "Kod kreskowy jest już przypisany do innego produktu.");
    return;
  }

  return data;
};

export const useInsertBarcode = (inventory_id: number) => {
  const queryClient = useQueryClient();

  return useMutation(insertBarcode, {
    cacheTime: 0,
    onSuccess: () => {
      queryClient.invalidateQueries(["barcodeList", inventory_id]);
    },
  });
};
