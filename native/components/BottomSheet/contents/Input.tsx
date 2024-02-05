// import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isAndroid } from "../../../constants";
import { createStyles } from "../../../theme/useStyles";
import { useKeyboard } from "../../../utils/useKeyboard";
import { Button } from "../../Button";
import TextInputController from "../../TextInputController";
import { Typography } from "../../Typography";

type InputBottomSheetForm = {
  quantity: string;
};

export const InputBottomSheetContent = ({
  quantity,
  setQuantity,
  closeBottomSheet,
}: {
  quantity: number;
  setQuantity: (quantity: number) => void;
  closeBottomSheet: () => void;
}) => {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const {
    coordinates: {
      end: { height: keyboardHeight },
    },
  } = useKeyboard();
  const {
    control,
    handleSubmit,
    setFocus: _setFocus,
    formState,
  } = useForm<InputBottomSheetForm>({
    defaultValues: {
      quantity: quantity.toString(),
    },
    mode: "onChange",
  });

  const isErrored = !!formState.errors.quantity?.message;

  // useEffect(() => {
  //   // hack needed to make android focus the input
  //   if (isAndroid) {
  //     setTimeout(() => {
  //       setFocus("quantity");
  //     }, 1);
  //     return;
  //   }
  //   setFocus("quantity");
  // }, []);

  // useEffect(() => {
  //   const keyboardWillHide = Keyboard.addListener("keyboardWillHide", () =>
  //     setFocus("quantity")
  //   );
  //   const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () =>
  //     setFocus("quantity")
  //   );
  //   const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
  //     setFocus("quantity");
  //   });
  //   return () => {
  //     keyboardWillHide.remove();
  //     keyboardDidHide.remove();
  //     keyboardDidShow.remove();
  //   };
  // }, [isErrored, setFocus, handleSubmit]);

  const onSubmit = (data: InputBottomSheetForm) => {
    !isErrored && Keyboard.dismiss();
    setQuantity(parseFloat(data.quantity.replace(/,/g, ".")));
    !isErrored && closeBottomSheet();
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: keyboardHeight + (isAndroid ? 0 : 156),
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Typography style={styles.inputLabel} color="new_darkGrey">
          Wpisz ilość
        </Typography>
        <Button
          type="primary"
          size="xs"
          containerStyle={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          Zapisz
        </Button>
      </View>
      <TextInputController
        control={control}
        name="quantity"
        rules={{
          required: {
            value: true,
            message: "Pole wymagane",
          },
          min: {
            value: 0.01,
            message: "Minimalna ilość to 0.01",
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
          onSubmitEditing: handleSubmit(onSubmit),
          keyboardType: "numeric",
          keyboardAppearance: "dark",
          autoFocus: true,
        }}
      />
    </View>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.new_darkBlue,
      paddingTop: theme.spacing,
      paddingHorizontal: theme.spacing * 2,
    },
    inputLabel: {
      paddingBottom: theme.spacing,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: theme.spacing,
    },
    button: {
      width: "30%",
    },
  })
);
