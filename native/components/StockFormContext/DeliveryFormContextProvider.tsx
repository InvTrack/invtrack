import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ProcessInvoiceResponse } from "../../db/types";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { StockForm } from "./types";

const getValuesForForm = (processInvoiceResponse: ProcessInvoiceResponse) => {
  if (processInvoiceResponse == null) {
    return undefined;
  }
  return processInvoiceResponse.form;
};

export const DeliveryFormContextProvider = ({
  children,
}: {
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

  useEffect(() => {
    const valuesForForm = getValuesForForm(processedInvoice);
    if (!valuesForForm) return;

    for (const record_id in valuesForForm) {
      if (record_id in dirtyFields) continue;
      methods.setValue(
        `product_records.${record_id}.quantity`,
        valuesForForm[record_id].quantity,
        {
          shouldDirty: true,
        }
      );
      methods.setValue(
        `product_records.${record_id}.price_per_unit`,
        valuesForForm[record_id].price_per_unit,
        {
          shouldDirty: true,
        }
      );
    }
  }, [processedInvoice]);

  useEffect(() => {
    const valuesForForm = newMatched;

    for (const record_id in valuesForForm) {
      if (record_id in dirtyFields) continue;
      methods.setValue(
        `product_records.${record_id}.quantity`,
        valuesForForm[record_id].quantity,
        {
          shouldDirty: true,
        }
      );
      methods.setValue(
        `product_records.${record_id}.price_per_unit`,
        valuesForForm[record_id].price_per_unit,
        {
          shouldDirty: true,
        }
      );
    }
  }, [newMatched]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
