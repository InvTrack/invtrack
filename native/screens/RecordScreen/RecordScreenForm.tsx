import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CollapsibleItem } from "../../components/Collapsible/CollapsibleItem";
import { SingularCollapsible } from "../../components/Collapsible/SingularCollapsible";
import TextInputController from "../../components/TextInputController";
import { formatFloatString } from "../../utils";

type RecordScreenForm = {
  price_per_unit: string;
};

export const useRecordScreenForm = (
  price: number,
  setPrice: (v: number) => void
) => {
  const {
    control,
    handleSubmit,
    setFocus: _setFocus,
    formState,
    watch,
  } = useForm<RecordScreenForm>({
    defaultValues: {
      price_per_unit: price.toString(),
    },
    values: {
      price_per_unit: price.toString(),
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (formState.isValid && !formState.isValidating) {
      handleSubmit((data) => {
        onSubmit(data);
      })();
    }
  }, [handleSubmit, watch, formState.isValid, formState.isValidating]);

  const onSubmit = (data: RecordScreenForm) => {
    setPrice(formatFloatString(data.price_per_unit));
  };
  return {
    onSubmit,
    control,
    handleSubmit,
  };
};

export const RecordScreenPriceCollapsible = ({
  control,
  handleSubmit,
  onSubmit,
  unit,
}: {
  control: ReturnType<typeof useRecordScreenForm>["control"];
  handleSubmit: ReturnType<typeof useRecordScreenForm>["handleSubmit"];
  onSubmit: ReturnType<typeof useRecordScreenForm>["onSubmit"];
  unit: string | null;
}) => {
  return (
    <SingularCollapsible title="Aktualna cena">
      <CollapsibleItem isFirst isLast>
        <TextInputController
          control={control}
          name="price_per_unit"
          rules={{
            required: {
              value: true,
              message: "Pole wymagane",
            },
            min: {
              value: 0,
              message: "Minimalna ilość to 0",
            },
            max: {
              value: 999999999,
              message: "Maksymalna ilość to 999999999",
            },
            pattern: {
              message:
                "Niepoprawna wartość, tylko liczby, maksymalnie 2 miejsca po przecinku",
              value: /^[0-9]+([.,][0-9]{1,2})?$/,
            },
          }}
          textInputProps={{
            label: `zł/${unit ?? ""}`,
            autoFocus: true,
            onSubmitEditing: handleSubmit(onSubmit),
            keyboardType: "numeric",
            keyboardAppearance: "dark",
          }}
        />
      </CollapsibleItem>
    </SingularCollapsible>
  );
};
