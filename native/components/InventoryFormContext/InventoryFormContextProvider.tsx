import { FormProvider, useForm } from "react-hook-form";
import { InventoryForm } from "./inventoryForm.types";

export const InventoryFormContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const methods = useForm<InventoryForm>();
  return <FormProvider {...methods}>{children}</FormProvider>;
};
