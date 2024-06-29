import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import TextInputController from "../components/TextInputController";

import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import NumberInputController from "../components/NumberInputController";
import { useSnackbar } from "../components/Snackbar/hooks";
import { Tooltip } from "../components/Tooltip";
import { Typography } from "../components/Typography";
import { useCreateProduct } from "../db/hooks/useCreateProduct";
import { HomeStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type NewProductScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "NewProductScreen"
>;

export type CreateProductFormValues = {
  name: string;
  unit: string;
  steps: number[];
};

const tooltipTitle = "Dodawanie produktów";
const tooltipTextContent = `Brakuje ci produktu do policzenia? Dodaj go uproszczonym kreatorem w aplikacji. Proponujemy, aby jednostka była taka sama jak ta na fakturze, zapisana skrótem. 
Np. opakowanie 6 sztuk -> opak.
Produkt dostanie automatycznie dodany do bieżącej inwentaryzacji/dostawy.`;

export function NewProductScreen({
  navigation,
  route: {
    params: { inventoryId },
  },
}: NewProductScreenProps) {
  const styles = useStyles();
  const { isConnected } = useNetInfo();
  const { showError, showSuccess } = useSnackbar();

  const { control, handleSubmit } = useForm<CreateProductFormValues>({
    defaultValues: {
      name: "",
      unit: "szt.",
      steps: [1, 5, 10],
    },
    mode: "onSubmit",
  });
  const { mutate, isSuccess, isLoading, isError } =
    useCreateProduct(inventoryId);

  useEffect(() => {
    if (isSuccess) {
      showSuccess("Dodano nowy produkt");
      navigation.goBack();
    }
  }, [navigation, isSuccess]);

  useEffect(() => {
    if (isError) {
      showError("Nie udało się zapisać zmian");
    }
  }, [isError]);

  const onSubmit = (data: CreateProductFormValues) => {
    if (!isConnected) {
      showError("Brak połączenia z internetem");
      return;
    }
    mutate(data);
  };

  const handlePress = handleSubmit(onSubmit);

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View>
        <Typography style={styles.title} variant="xlBold" color="lightGrey">
          Nowy produkt
        </Typography>
        <Tooltip
          title={tooltipTitle}
          textContent={tooltipTextContent}
          iconContainerStyle={{
            ...styles.title,
            position: "absolute",
            right: 0,
          }}
        />
      </View>
      <Typography
        style={{ marginBottom: 16 }}
        variant="lBold"
        color="lightGrey"
      >
        Nazwa
      </Typography>
      <TextInputController
        control={control}
        name="name"
        rules={{
          minLength: { value: 3, message: "Minimalna długość to 3 znaki" },
          maxLength: { value: 50, message: "Maksymalna długość to 50 znaków" },
          required: { value: true, message: "Wymagane" },
        }}
        textInputProps={{
          placeholder: "Nazwa produktu",
          containerStyle: styles.mb,
        }}
      />
      <Typography
        style={{ marginBottom: 16 }}
        variant="lBold"
        color="lightGrey"
      >
        Jednostka
      </Typography>
      <TextInputController
        control={control}
        name="unit"
        rules={{
          minLength: { value: 3, message: "Minimalna długość to 3 znaki" },
          maxLength: { value: 50, message: "Maksymalna długość to 50 znaków" },
          required: { value: true, message: "Wymagane" },
        }}
        textInputProps={{
          placeholder: "szt.",
          containerStyle: styles.mb,
        }}
      />
      <Typography
        style={{ marginBottom: 16 }}
        variant="lBold"
        color="lightGrey"
      >
        Step
      </Typography>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <NumberInputController
          control={control}
          name="steps.0"
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
              value: 999,
              message: "Maksymalna ilość to 999",
            },
            pattern: {
              message:
                "Niepoprawna wartość, tylko liczby, maksymalnie 2 miejsca po przecinku",
              value: /^[0-9]+([.,][0-9]{1,2})?$/,
            },
          }}
          textInputProps={{
            placeholder: "1",
            containerStyle: { ...styles.mb, marginRight: 8, flex: 1 },
          }}
        />
        <NumberInputController
          control={control}
          name="steps.1"
          rules={{
            minLength: { value: 3, message: "Minimalna długość to 3 znaki" },
            maxLength: {
              value: 50,
              message: "Maksymalna długość to 50 znaków",
            },
            required: { value: true, message: "Wymagane" },
          }}
          textInputProps={{
            placeholder: "5",
            containerStyle: { ...styles.mb, marginHorizontal: 8, flex: 1 },
          }}
        />
        <NumberInputController
          control={control}
          name="steps.2"
          rules={{
            minLength: { value: 3, message: "Minimalna długość to 3 znaki" },
            maxLength: {
              value: 50,
              message: "Maksymalna długość to 50 znaków",
            },
            required: { value: true, message: "Wymagane" },
          }}
          textInputProps={{
            placeholder: "10",
            containerStyle: { ...styles.mb, marginLeft: 8, flex: 1 },
          }}
        />
      </View>
      <Button
        type="primary"
        size="s"
        shadow
        isLoading={isLoading}
        fullWidth
        containerStyle={styles.buttonContainer}
        // looks werid but prevents a synthetic event warn
        onPress={handlePress}
        disabled={!isConnected}
      >
        Dodaj
      </Button>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 5,
    },
    mb: {
      marginBottom: theme.spacing * 3,
    },
    title: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing * 4,
      marginTop: "20%",
    },
    buttonContainer: {
      alignSelf: "center",
    },
  })
);
