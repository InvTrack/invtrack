import { FormProvider, useForm } from "react-hook-form";
import { DeliveryForm } from "./deliveryForm.types";

export const DeliveryFormContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<DeliveryForm>();
  return <FormProvider {...methods}>{children}</FormProvider>;
};
