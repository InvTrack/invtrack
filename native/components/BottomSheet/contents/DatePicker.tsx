import DateTimePicker from "@react-native-community/datetimepicker";
import formatISO from "date-fns/formatISO";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../../Button";
import { Typography } from "../../Typography";

// TODO Android styling
export const DatePickerBottomSheetContent = ({
  dateValue,
  setDateValue,
  closeBottomSheet,
}: {
  dateValue: Date;
  setDateValue: (value: string) => void;
  closeBottomSheet: () => void;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingBottom: 16 + insets.bottom,
        paddingTop: 16,
        backgroundColor: "#fff",
      }}
    >
      <Typography
        style={{
          alignSelf: "center",
        }}
      >
        Wybierz datę
      </Typography>
      <DateTimePicker
        value={dateValue}
        mode={"date"}
        display="spinner"
        onChange={(e, d) => {
          if (e.type === "dismissed") {
            return;
          }
          setDateValue((d && formatISO(d)) ?? "");
        }}
        style={{
          alignSelf: "center",
          backgroundColor: "white",
        }}
      />
      <DateTimePicker
        value={dateValue}
        mode={"time"}
        display="spinner"
        is24Hour={true}
        onChange={(e, d) => {
          if (e.type === "dismissed") {
            return;
          }
          setDateValue((d && formatISO(d)) ?? "");
        }}
        style={{
          alignSelf: "center",
          backgroundColor: "white",
        }}
      />
      <Button
        type="primary"
        size="l"
        containerStyle={{ alignSelf: "center", width: "50%" }}
        onPress={closeBottomSheet}
      >
        <Typography>Zapisz</Typography>
      </Button>
    </View>
  );
};
