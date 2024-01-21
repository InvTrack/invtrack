import React from "react";
import { StyleSheet, View } from "react-native";

import { formatISO } from "date-fns";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { DateInputController } from "../components/DateInputController";
import TextInputController from "../components/TextInputController";

import { ToggleController } from "../components/ToggleController";
import { Typography } from "../components/Typography";
import { useCreateInventory } from "../db";
import { createStyles } from "../theme/useStyles";

export type CreateInventoryFormValues = {
  name: string;
  date: string;
  is_delivery: boolean;
};

export default function CreateInventory() {
  const styles = useStyles();
  const router = useRouter();

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
  const is_delivery = watch("is_delivery");

  const {
    mutate,
    data: inventory,
    isSuccess,
    isLoading,
  } = useCreateInventory();

  const onSubmit = (data: CreateInventoryFormValues) => {
    mutate(data);
  };

  const setDateValue = (value: string) => {
    reset({ ...getValues, date: value });
  };

  React.useEffect(() => {
    if (isSuccess && inventory) {
      // FIXME - currently crashes the app, probably an expo-router issue
      // const route = inventory.is_delivery ? "delivery" : "inventory";
      // const routeToNewInventory = `/(tabs)/${route}-${inventory.id}` as const;
      const routeToNewInventory = `/(tabs)/list` as const;
      router.push(routeToNewInventory);
    }
  }, [isSuccess, inventory, router.push]);

  const handlePress = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <Typography
        underline
        style={styles.title}
        variant="xlBold"
        color="darkBlue"
      >
        {`Nowy wpis:`}
      </Typography>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <ToggleController control={control} name="is_delivery" />
        <Typography variant="l" color="darkBlue">
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
          placeholder: "nazwa",
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
        size="xs"
        shadow
        isLoading={isLoading}
        containerStyle={styles.buttonContainer}
        // looks werid but prevents a synthetic event warn
        onPress={handlePress}
      >
        Dodaj
      </Button>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 5,
    },
    mb: {
      marginBottom: theme.spacing * 3,
    },
    title: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing * 10,
      marginTop: "20%",
    },
    buttonContainer: {
      width: "100%",
    },
  })
);
