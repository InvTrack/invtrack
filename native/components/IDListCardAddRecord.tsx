import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Button } from "./Button";

export const IDListCardAddRecord = ({
  inventoryId,
}: {
  inventoryId: number;
}) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  return (
    <Button
      size="s"
      fullWidth
      type="primary"
      containerStyle={styles.button}
      onPress={() => {
        navigation.navigate("AddRecordScreen", { inventoryId });
      }}
    >
      Dodaj brakujące produkty
    </Button>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    button: {
      borderRadius: theme.borderRadiusSmall,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginTop: theme.spacing,
      marginBottom: theme.spacing,
    },
  })
);
