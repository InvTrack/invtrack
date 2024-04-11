// import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isAndroid } from "../../../constants";
import { createStyles } from "../../../theme/useStyles";
import { formatFloatString } from "../../../utils";
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
  shouldAllowFloatAsValue = true,
}: {
  quantity: number | null;
  setQuantity: (quantity: number) => void;
  closeBottomSheet: () => void;
  shouldAllowFloatAsValue?: boolean;
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
      quantity: quantity?.toString(),
    },
    mode: "onChange",
  });

  const isErrored = !!formState.errors.quantity?.message;

  const onSubmit = (data: InputBottomSheetForm) => {
    !isErrored && Keyboard.dismiss();
    setQuantity(formatFloatString(data.quantity));
    !isErrored && closeBottomSheet();
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          height: isAndroid ? undefined : keyboardHeight + 156,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Typography style={styles.inputLabel} color="lightGrey">
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
            value: 0,
            message: "Minimalna ilość to 0",
          },
          max: {
            value: 999999999,
            message: "Maksymalna ilość to 999999999",
          },
          pattern: shouldAllowFloatAsValue
            ? {
                message:
                  "Niepoprawna wartość, tylko liczby, maksymalnie 2 miejsca po przecinku",
                value: /^[0-9]+([.,][0-9]{1,2})?$/,
              }
            : {
                message: "Niepoprawna wartość, tylko liczby całkowite",
                value: /^[0-9]+$/,
              },
        }}
        textInputProps={{
          onSubmitEditing: handleSubmit(onSubmit),
          keyboardType: "numeric",
          keyboardAppearance: "dark",
          autoFocus: true,
        }}
      />
    </KeyboardAvoidingView>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
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
