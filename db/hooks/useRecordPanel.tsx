import { useGetRecord } from ".";
import { useUpdateRecord } from "./useUpdateRecord";
import { useCallback } from "react";

/**
 * Hook do obsługi "karty produktu".
 *
 * Wystawia `quantity`, oraz `setQuantity` do ręcznego ustawiania ilości danego produktu.
 *
 * Wystawia `negativeSteppers` i `positiveSteppers` do "skakania" o 5, 10, itd.
 *
 * Wystawia też `data` informacje potrzebne do przedstawienia produktu w UI.
 *
 */
export const useRecordPanel = (recordId: string) => {
  const { mutate } = useUpdateRecord(recordId);
  const recordResult = useGetRecord(recordId);
  const { data, isSuccess } = recordResult;

  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => mutate({ quantity: (data?.quantity as number) + step }),
        step,
      } as const),
    [mutate, data?.quantity]
  );

  const setQuantity = useCallback(
    (quantity: number) => mutate({ quantity }),
    [mutate]
  );

  if (!isSuccess || !data || !data.steps)
    return {
      steppers: { negative: [], positive: [] },
      setQuantity,
      ...recordResult,
    } as const;

  return {
    steppers: {
      negative: data.steps.map((step) => stepperFunction(-step)),
      positive: data.steps.map((step) => stepperFunction(step)),
    },
    setQuantity,
    ...recordResult,
  } as const;
};
