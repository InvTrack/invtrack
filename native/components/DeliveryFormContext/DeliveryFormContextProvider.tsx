import { useContext } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ScanDocResponse } from "../../db/types";
import { DocumentScannerContext } from "../DocumentScanner/DocumentScannerContext";
import { DeliveryForm } from "./deliveryForm.types";
const getValues = (scanDocResponse: ScanDocResponse) => {
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
  const { state } = useContext(DocumentScannerContext);
  const methods = useForm<DeliveryForm>({
    values: getValues(state.processedInvoice),
    resetOptions: { keepDirtyValues: true },
  });

  // @ts-expect-error
  const _dirtyFields = methods.formState.dirtyFields;
  // @ts-expect-error
  const _isDirty = methods.formState.isDirty;

  return <FormProvider {...methods}>{children}</FormProvider>;
};
