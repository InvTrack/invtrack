import React from "react";
import { Link, Stack } from "expo-router";
import { useListInventories } from "../../db";
import { StyleSheet, View } from "react-native";
import { Typography } from "../../components/Typography";
import { createStyles } from "../../theme/useStyles";
import { Button } from "../../components/Button";

export default function Calendar() {
  const styles = useStyles();
  const { data: inventories, isLoading } = useListInventories();
  if (isLoading || !inventories)
    return <Stack.Screen options={{ title: "Loading" }} />;
  return (
    <>
      <Stack.Screen options={{ title: "Kalendarz" }} />
      <View style={styles.screen}>
        <Typography>Lista inwentaryzacji</Typography>
        {inventories.map(({ id, name }) => (
          <Link
            href={{
              pathname: `/inventory/[inventory]/`,
              params: { inventory: id },
            }}
            key={id}
          >
            <Typography>{name}</Typography>
          </Link>
        ))}
        <Link href={"/new"}>
          <Button type="primary" size="xl">
            <Typography>Dodaj inwentaryzację</Typography>
          </Button>
        </Link>
      </View>
    </>
  );
}

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    screen: {
      backgroundColor: theme.colors.mediumBlue,
      height: "100%",
    },
  })
);
