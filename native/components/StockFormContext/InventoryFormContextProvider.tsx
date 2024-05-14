import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ProcessSalesRaportResponse } from "../../db/types";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { StockForm } from "./types";

const getValuesForForm = (
  processInvoiceResponse: ProcessSalesRaportResponse
) => {
  if (processInvoiceResponse == null) {
    return undefined;
  }
  return processInvoiceResponse.form;
};

export const InventoryFormContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const processedSalesRaport = useAppSelector(
    documentScannerSelector.selectProcessedSalesRaport
  );
  const methods = useForm<StockForm>({
    defaultValues: { product_records: {}, recipe_records: {} },
  });

  const dirtyFields = methods.formState.dirtyFields;

  useEffect(() => {
    const valuesForForm = getValuesForForm(processedSalesRaport);
    if (!valuesForForm) return;

    for (const record_id in valuesForForm) {
      if (record_id in dirtyFields) continue;
      methods.setValue(
        `recipe_records.${record_id}.quantity`,
        valuesForForm[record_id].quantity,
        {
          shouldDirty: true,
        }
      );
    }
  }, [processedSalesRaport]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
