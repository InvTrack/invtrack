import { useMutation, useQueryClient } from "react-query";
import { useGetRecord } from ".";
import { supabase } from "../supabase";
import { Record, RecordTable } from "../types";

/**
 * Hook do obsługi "karty produktu".
 *
 * Po załadowaniu wystawia `quantity`, oraz `setQuantity` do ręcznego ustawiania ilości danego produktu,
 * oraz `negativeSteppers` i `positiveSteppers` do "skakania" o 5, 10, itd.
 *
 */
export const useRecordPanel = (recordId: string) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    async (quantity: number) => {
      const { data, error } = await supabase
        .from<"record", RecordTable>("record")
        .update({ quantity })
        .eq("id", recordId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      onMutate: async (quantity: number) => {
        await queryClient.cancelQueries(["record", recordId]);
        const previousRecord = queryClient.getQueryData<Record>([
          "record",
          recordId,
        ]);
        if (previousRecord?.quantity) {
          queryClient.setQueryData(["record", recordId], {
            ...previousRecord,
            quantity: quantity,
          });
        }
        return { previousRecord };
      },
      onSettled: () => queryClient.invalidateQueries(["record", recordId]),
    }
  );

  const { data, isSuccess } = useGetRecord(recordId);

  if (!isSuccess || !data.steps || !data.quantity)
    return { isLoading: true } as { isLoading: true };

  return {
    steppers: {
      negative: data.steps.map(
        (step) =>
          ({
            click: () => mutate((data.quantity as number) - step),
            step,
          } as const)
      ),
      positive: data.steps.map(
        (step) =>
          ({
            click: () => mutate((data.quantity as number) + step),
            step,
          } as const)
      ),
    },
    setQuantity: mutate,
    quantity: data.quantity,
    name: data.name,
    unit: data.unit,
    isLoading: false,
  } as const;
};
