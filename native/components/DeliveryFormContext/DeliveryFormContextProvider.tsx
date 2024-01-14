import { FormProvider, useForm } from "react-hook-form";

type DeliveryForm = {
  [record_id: number]: {
    quantity: number;
  };
};
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
