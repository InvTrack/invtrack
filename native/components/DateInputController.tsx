import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import formatISO from "date-fns/formatISO";
import { FieldValues, UseControllerProps } from "react-hook-form";
import { StyleSheet, TouchableOpacity } from "react-native";
import { isAndroid } from "../constants";
import { createStyles } from "../theme/useStyles";
import { useBottomSheet } from "./BottomSheet";
import { DatePickerBottomSheetContent } from "./BottomSheet/contents/DatePicker";
import TextInputController from "./TextInputController";

type DateInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  dateValue: Date;
  setDateValue: (value: string) => void;
  RHFValue: string;
};

const openDateInputAndroid = (
  dateValue: Date,
  setDateValue: (value: string) => void
) => {
  DateTimePickerAndroid.open({
    mode: "date",
    value: dateValue,
    is24Hour: true,
    display: "spinner",
    onChange: (e, date) => {
      if (e.type === "dismissed") {
        return;
      }
      const updatedDate = date || dateValue; // Use the selected date or the existing dateValue
      DateTimePickerAndroid.open({
        mode: "time",
        value: updatedDate,
        is24Hour: true,
        display: "spinner",
        onChange: (e, time) => {
          if (e.type === "dismissed") {
            return;
          }
          if (time) {
            const updatedDateTime = new Date(updatedDate);
            updatedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDateValue(formatISO(updatedDateTime)); // Set the updated datetime
          }
        },
      });
    },
  });
};
export const DateInputController = <T extends FieldValues>({
  control,
  name,
  dateValue,
  setDateValue,
  RHFValue,
}: DateInputControllerProps<T>) => {
  const { openBottomSheet, closeBottomSheet } = useBottomSheet();
  const styles = useStyles();

  const openDateInputIos = () =>
    openBottomSheet(() => (
      <DatePickerBottomSheetContent
        dateValue={dateValue}
        setDateValue={setDateValue}
        closeBottomSheet={closeBottomSheet}
      />
    ));

  return (
    <TouchableOpacity
      onPress={
        isAndroid
          ? () => openDateInputAndroid(dateValue, setDateValue)
          : () => openDateInputIos()
      }
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
          containerStyle: styles.mb,
          inputStyle: styles.input,
        }}
      />
    </TouchableOpacity>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    button: {
      width: "100%",
    },
    mb: {
      marginBottom: theme.spacing * 3,
    },
    input: {
      color: theme.colors.darkBlue,
    },
  })
);
