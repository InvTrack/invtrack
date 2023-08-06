import React from "react";
import { StyleSheet, View } from "react-native";

import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../components/Button";
import { Typography } from "../../../components/Typography";
import { useListInventories } from "../../../db";
import { createStyles } from "../../../theme/useStyles";

export default function Calendar() {
  const styles = useStyles();
  const { data: inventories, isLoading } = useListInventories();

  if (isLoading || !inventories)
    return <Typography variant="xlBold">LOADING...</Typography>;
  return (
    <SafeAreaView edges={["left", "right"]}>
      <View style={styles.screen}>
        <Typography>Lista inwentaryzacji</Typography>
        {inventories.map(({ id, name }) => {
          return (
            <Link
              href={{
                pathname: `/(tabs)/inventory/[inventory]/`,
                params: { inventory: id },
              }}
              key={id}
            >
              <Typography>{name}</Typography>
            </Link>
          );
        })}
        <Link href="/new">
          <Button type="primary" size="xl">
            <Typography>Dodaj inwentaryzację</Typography>
          </Button>
        </Link>
      </View>
    </SafeAreaView>
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
