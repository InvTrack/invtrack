import React from "react";
import { StyleSheet, View } from "react-native";

import { formatISO } from "date-fns";
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

  const now = new Date(Date.now());

  const { control, handleSubmit, getValues, reset } =
    useForm<CreateInventoryFormValues>({
      defaultValues: {
        name: "Inwentaryzacja dzisiaj",
        date: formatISO(now),
      },
      resetOptions: {
        keepDirtyValues: true,
      },
    });

  const { mutate, status: _status } = useCreateInventory();

  const onSubmit = (data: CreateInventoryFormValues) => {
    mutate(data);
  };

  const setDateValue = (value: string) => {
    reset({ ...getValues, date: value });
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View style={styles.ph}>
        <Typography style={styles.title} variant="xlBold" color="darkBlue">
          {`Nowa \ninwentaryzacja`}:
        </Typography>
        <TextInputController control={control} name="name" />
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
          containerStyle={styles.buttonContainer}
          onPress={handleSubmit(onSubmit)}
        >
          <Typography>Dodaj</Typography>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.lightBlue,
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      width: "100%",
    },
    ph: { paddingHorizontal: theme.spacing * 6 },
    title: {
      alignItems: "center",
      justifyContent: "center",
    },
    buttonContainer: { width: "100%" },
  })
);
