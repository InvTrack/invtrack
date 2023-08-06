import React from "react";
import { StyleSheet, View } from "react-native";

import { formatISO } from "date-fns";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { DateInputController } from "../components/DateInputController";
import TextInputController from "../components/TextInputController";
import { Typography } from "../components/Typography";
import { useCreateInventory } from "../db";
import { createStyles } from "../theme/useStyles";

export type CreateInventoryFormValues = {
  name: string;
  date: string;
};

export default function CreateInventory() {
  const styles = useStyles();
  const router = useRouter();

  const now = new Date(Date.now());

  const { control, handleSubmit, getValues, reset } =
    useForm<CreateInventoryFormValues>({
      defaultValues: {
        name: "",
        date: formatISO(now),
      },
      resetOptions: {
        keepDirtyValues: true,
      },
      mode: "onSubmit",
    });

  const { mutate, data: inventory, isSuccess } = useCreateInventory();

  const onSubmit = (data: CreateInventoryFormValues) => {
    mutate(data);

    if (isSuccess && inventory) {
      const routeToNewInventory =
        `/(tabs)/inventory/${inventory[0].id}/` as const;
      router.replace(routeToNewInventory);
    }
  };

  const setDateValue = (value: string) => {
    reset({ ...getValues, date: value });
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <Typography
        underline
        style={styles.title}
        variant="xlBold"
        color="darkBlue"
      >
        {`Nowa \ninwentaryzacja`}:
      </Typography>
      <View style={styles.mb}>
        <TextInputController
          control={control}
          name="name"
          rules={{
            minLength: { value: 3, message: "Minimalna długość" },
            maxLength: { value: 30, message: "Maksymalna długość" },
            required: { value: true, message: "Wymagane" },
          }}
          textInputProps={{
            placeholder: "nazwa",
          }}
        />
      </View>
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
        containerStyle={styles.buttonContainer}
        onPress={handleSubmit(onSubmit)}
      >
        <Typography variant="m" color="darkBlue">
          Dodaj
        </Typography>
      </Button>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 6,
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
