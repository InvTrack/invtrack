import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { useCreateProductRecords } from "../../db/hooks/useCreateProductRecords";
import { useListProductRecords } from "../../db";
import { useListRecipeRecords } from "../../db/hooks/useListRecipeRecords";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { StockForm } from "./types";

export const DeliveryFormContextProvider = ({
  inventoryId,
  children,
}: {
  inventoryId: number;
  children: React.ReactNode;
}) => {
  const processedInvoice = useAppSelector(
    documentScannerSelector.selectProcessedInvoice
  );
  const { data: productRecordsRaw } = useListProductRecords(inventoryId);

  const { data: recipeRecordsRaw } = useListRecipeRecords(inventoryId);

  const methods = useForm<StockForm>({
    defaultValues: { product_records: {}, recipe_records: {} },
  });

  useEffect(() => {
    const product_records: StockForm["product_records"] = productRecordsRaw
      ? Object.fromEntries(
          productRecordsRaw.map((record) => [
            record.product_id,
            {
              id: record.id,
              quantity: record.quantity,
              price_per_unit: record.price_per_unit,
            },
          ])
        )
      : {};
    const recipe_records: StockForm["recipe_records"] = recipeRecordsRaw
      ? Object.fromEntries(
          recipeRecordsRaw.map((record) => [
            record.id,
            { quantity: record.quantity, recipe_id: record.recipe_id },
          ])
        )
      : {};
    methods.reset({ product_records, recipe_records });
  }, [productRecordsRaw]);

  const newMatched = useAppSelector(documentScannerSelector.selectNewMatched);

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

    const matchedProductsNotInInventory =
      processedInvoice.matchedProductsNotInInventory;

    for (const product_id in matchedProductsNotInInventory) {
      // if (record_id in dirtyFields) continue;
      methods.setValue(
        `product_records.${product_id}.quantity`,
        matchedProductsNotInInventory[product_id].quantity,
        { shouldDirty: true }
      );
      methods.setValue(
        `product_records.${product_id}.price_per_unit`,
        matchedProductsNotInInventory[product_id].price_per_unit,
        { shouldDirty: true }
      );
    }
    // console.log(methods.getValues());
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
