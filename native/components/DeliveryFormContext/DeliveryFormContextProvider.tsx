import { FormProvider, useForm } from "react-hook-form";
import { DeliveryForm } from "./deliveryForm.types";

export const DeliveryFormContextProvider = ({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues: DeliveryForm;
}) => {
  const methods = useForm<DeliveryForm>({ defaultValues });
  return <FormProvider {...methods}>{children}</FormProvider>;
};
