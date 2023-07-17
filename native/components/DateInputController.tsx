import { FieldValues, UseControllerProps } from "react-hook-form";
import { TouchableOpacity } from "react-native";
import { useBottomSheet } from "./BottomSheet";
import { DatePickerBottomSheetContent } from "./BottomSheet/contents/DatePicker";
import TextInputController from "./TextInputController";

type DateInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  dateValue: Date;
  setDateValue: (value: string) => void;
  RHFValue: string;
};

export const DateInputController = <T extends FieldValues>({
  control,
  name,
  dateValue,
  setDateValue,
  RHFValue,
}: DateInputControllerProps<T>) => {
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();

  const openDateInput = () =>
    openBottomSheet(() => (
      <DatePickerBottomSheetContent
        dateValue={dateValue}
        setDateValue={setDateValue}
        closeBottomSheet={closeBottomSheet}
      />
    ));

  return (
    <TouchableOpacity
      onPress={() => {
        openDateInput();
      }}
    >
      <TextInputController
        control={control}
        name={name}
        textInputProps={{
          disabled: true,
          editable: false,
          focusable: false,
          value: new Date(RHFValue).toLocaleDateString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour12: false,
          }),
        }}
      />
    </TouchableOpacity>
  );
};
