import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { PlusIcon } from "../Icon";

export const InventoryCardAdd = () => {
  const styles = useStyles();
  return (
    <Card color="mediumBlue" style={styles.plusCard} padding="none">
      <PlusIcon size={25} />
    </Card>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    plusCard: {
      height: 45,
      borderRadius: theme.borderRadiusSmall,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing * 2,
    },
  })
);
