import { useCallback, useEffect } from "react";

import isEmpty from "lodash/isEmpty";
import { useFormContext } from "react-hook-form";
import { DeliveryForm } from "../../components/DeliveryFormContext/deliveryForm.types";
import { useGetRecord } from "./useGetRecord";

/**
 * This hook simplifies the process of populating the form with the backend data.
 * Registers the records as needed, returns values needed to manipulate the form in a safe way.
 *
 * Submitting the form is done in a separate hook.
 */
export const useRecordPanel = (recordId: number) => {
  const recordResult = useGetRecord(recordId);
  const deliveryForm = useFormContext<DeliveryForm>();
  if (!deliveryForm) throw new Error("Missing deliveryForm context");

  const { data: record, isSuccess } = recordResult;

  useEffect(() => {
    if (!record?.id || !record?.product_id || !record.quantity) return;

    const formValues = deliveryForm.getValues();
    const shouldRegister = isEmpty(formValues[record.id?.toString()]);

    if (!shouldRegister) return;

    // set the new values
    deliveryForm.register(record.id?.toString(), {
      value: { quantity: record.quantity, product_id: record.product_id },
    });
  }, [record?.id, record?.product_id, record?.quantity]);

  const quantity =
    deliveryForm.watch(`${record?.id!.toString()}.quantity`) ?? 0;

  const setQuantity = useCallback(
    (quantity: number) => {
      if (quantity < 0) return;
      if (!record?.id) return;
      // dot notation is more performant
      deliveryForm.setValue(`${record?.id!.toString()}.quantity`, quantity, {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    },
    [deliveryForm, record?.id, quantity]
  );
  const stepperFunction = useCallback(
    (step: number) =>
      ({
        click: () => {
          if (quantity + step < 0) {
            deliveryForm.setValue(
              // dot notation is more performant
              `${record?.id!.toString()}.quantity`,
              0,
              {
                shouldDirty: true,
                shouldTouch: true,
              }
            );
            return;
          }
          deliveryForm.setValue(
            // dot notation is more performant
            `${record?.id!.toString()}.quantity`,
            (quantity as number) + step,
            {
              shouldDirty: true,
              shouldTouch: true,
            }
          );
          return;
        },
        step,
      } as const),
    [quantity, record?.id, deliveryForm]
  );

  if (!isSuccess || !record || !record.steps)
    return {
      steppers: { negative: [], positive: [] },
      setQuantity,
      quantity,
      ...recordResult,
    } as const;

  return {
    steppers: {
      negative: record.steps.map((step) => stepperFunction(-step)),
      positive: record.steps.map((step) => stepperFunction(step)),
    },
    setQuantity,
    quantity,
    ...recordResult,
  } as const;
};
