import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { useCreateProductRecords } from "../../db/hooks/useCreateProductRecords";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { StockForm } from "./types";

export const DeliveryFormContextProvider = ({
  children,
}: {
  inventoryId: number;
  children: React.ReactNode;
}) => {
  const processedInvoice = useAppSelector(
    documentScannerSelector.selectProcessedInvoice
  );
  const newMatched = useAppSelector(documentScannerSelector.selectNewMatched);
  const methods = useForm<StockForm>({
    defaultValues: { product_records: {}, recipe_records: {} },
  });

  const dirtyFields = methods.formState.dirtyFields;

  // const { mutate: createProductRecords } = useCreateProductRecords(
  //   +inventoryId
  // );

  useEffect(() => {
    if (!processedInvoice) return;
    const matchedProductRecords = processedInvoice.matchedProductRecords;

    for (const record_id in matchedProductRecords) {
      const product_id = matchedProductRecords[record_id].product_id;
      if (record_id in dirtyFields) continue;
      methods.setValue(
        `product_records.${product_id}.quantity`,
        matchedProductRecords[record_id].quantity,
        { shouldDirty: true }
      );
      methods.setValue(
        `product_records.${product_id}.price_per_unit`,
        matchedProductRecords[record_id].price_per_unit,
        { shouldDirty: true }
      );
    }
  }, [processedInvoice]);

  useEffect(() => {
    for (const record_id in newMatched) {
      const product_id = newMatched[record_id].product_id;
      if (record_id in dirtyFields) continue;
      methods.setValue(
        `product_records.${product_id}.quantity`,
        newMatched[record_id].quantity,
        {
          shouldDirty: true,
        }
      );
      methods.setValue(
        `product_records.${product_id}.price_per_unit`,
        newMatched[record_id].price_per_unit,
        {
          shouldDirty: true,
        }
      );
    }
  }, [newMatched]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
