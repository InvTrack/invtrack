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
  const methods = useForm<DeliveryForm>({
    values: getValuesForForm(processedInvoice),
    resetOptions: { keepDirtyValues: true },
  });

  // @ts-expect-error
  const _dirtyFields = methods.formState.dirtyFields;
  // @ts-expect-error
  const _isDirty = methods.formState.isDirty;

  return <FormProvider {...methods}>{children}</FormProvider>;
};
