import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "../../../components/common/Button";
import { createStyles } from "../../../theme/useStyles";

export const IDListCardAddProduct = ({
  inventoryId,
}: {
  inventoryId: number | null;
}) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();

  return (
    <Button
      size="s"
      fullWidth
      type="primary"
      containerStyle={styles.button}
      disabled={inventoryId == null}
      onPress={() => {
        navigation.navigate("NewProductScreen", { inventoryId });
      }}
    >
      Dodaj nowy produkt
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
