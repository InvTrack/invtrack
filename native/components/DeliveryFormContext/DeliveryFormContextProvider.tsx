import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScanDocResponse } from "../../db/types";
import { documentScannerSelector } from "../../redux/documentScannerSlice";
import { useAppSelector } from "../../redux/hooks";
import { DeliveryForm } from "./deliveryForm.types";

const getValuesForForm = (scanDocResponse: ScanDocResponse) => {
  if (scanDocResponse == null) {
    return undefined;
  }
  return scanDocResponse.form;
};

export const DeliveryFormContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const processedInvoice = useAppSelector(
    documentScannerSelector.selectProcessedInvoice
  );
  const methods = useForm<DeliveryForm>();

  const dirtyFields = methods.formState.dirtyFields;

  useEffect(() => {
    const valuesForForm = getValuesForForm(processedInvoice);
    if (!valuesForForm) return;

    for (const record_id in valuesForForm) {
      if (record_id in dirtyFields) continue;

      methods.setValue(record_id, valuesForForm[record_id], {
        shouldDirty: true,
      });
    }
    console.log(methods.getValues());
  }, [processedInvoice]);

  return <FormProvider {...methods}>{children}</FormProvider>;
};
