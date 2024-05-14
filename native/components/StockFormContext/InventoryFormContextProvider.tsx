import { FormProvider, useForm } from "react-hook-form";
import { StockForm } from "./types";

export const InventoryFormContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<StockForm>({
    defaultValues: { product_records: {}, recipe_records: {} },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};
