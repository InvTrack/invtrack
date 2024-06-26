import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { formatISO } from "date-fns";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { DateInputController } from "../components/DateInputController";
import TextInputController from "../components/TextInputController";

import { useNetInfo } from "@react-native-community/netinfo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSnackbar } from "../components/Snackbar/hooks";
import { ToggleController } from "../components/ToggleController";
import { Typography } from "../components/Typography";
import { isAndroid } from "../constants";
import { useCreateInventory } from "../db";
import { HomeStackParamList } from "../navigation/types";
import { createStyles } from "../theme/useStyles";

type NewStockScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  "NewStockScreen"
>;

export type CreateInventoryFormValues = {
  name: string;
  date: string;
  is_delivery: boolean;
};

export function NewStockScreen({ navigation }: NewStockScreenProps) {
  const styles = useStyles();
  const { isConnected } = useNetInfo();
  const { showError } = useSnackbar();

  const now = new Date(Date.now());

  const { control, handleSubmit, getValues, reset, watch } =
    useForm<CreateInventoryFormValues>({
      defaultValues: {
        name: "",
        date: formatISO(now),
        is_delivery: true,
      },
      resetOptions: {
        keepDirtyValues: true,
      },
      mode: "onSubmit",
    });
  const {
    mutate,
    data: inventory,
    isSuccess,
    isLoading,
    isError,
  } = useCreateInventory();

  const is_delivery = watch("is_delivery");

  useEffect(() => {
    if (isSuccess && inventory) {
      if (is_delivery) {
        navigation.navigate("Tabs", {
          screen: "DeliveryTab",
          params: {
            id: inventory.id,
          },
        });
        return;
      }
      navigation.navigate("Tabs", {
        screen: "InventoryTab",
        params: {
          id: inventory.id,
        },
      });
    }
  }, [navigation, isSuccess, inventory, is_delivery]);

  useEffect(() => {
    if (isError) {
      showError("Nie udało się zapisać zmian");
    }
  }, [isError]);

  const onSubmit = (data: CreateInventoryFormValues) => {
    if (!isConnected) {
      showError("Brak połączenia z internetem");
      return;
    }
    mutate(data);
  };

  const setDateValue = (value: string) => {
    reset({ ...getValues, date: value });
  };

  const handlePress = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <Typography style={styles.title} variant="xlBold" color="lightGrey">
        Nowy wpis:
      </Typography>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginLeft: isAndroid ? -8 : 0,
          marginBottom: isAndroid ? 0 : 16,
        }}
      >
        <ToggleController control={control} name="is_delivery" />
        <Typography
          variant="l"
          color="lightGrey"
          style={{
            alignSelf: "center",
          }}
        >
          {is_delivery ? `Dostawa` : `Inwentaryzacja`}
        </Typography>
      </View>
      <TextInputController
        control={control}
        name="name"
        rules={{
          minLength: { value: 3, message: "Minimalna długość to 3 znaki" },
          maxLength: { value: 30, message: "Maksymalna długość to 30 znaków" },
          required: { value: true, message: "Wymagane" },
        }}
        textInputProps={{
          placeholder: "Nazwa",
          containerStyle: styles.mb,
        }}
      />
      <DateInputController
        control={control}
        name="date"
        setDateValue={setDateValue}
        RHFValue={getValues("date")}
        dateValue={
          formatISO(now) === getValues("date")
            ? now
            : new Date(getValues("date"))
        }
      />
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
      marginBottom: theme.spacing * 8,
      marginTop: "20%",
    },
    buttonContainer: {
      alignSelf: "center",
    },
  })
);
