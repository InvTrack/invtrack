// import { Link } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { PlusIcon } from "../Icon";

export const InventoryCardAdd = () => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  return (
    <Card
      color="mediumBlue"
      style={styles.plusCard}
      padding="none"
      onPress={() => {
        navigation.navigate("NewStockScreen");
      }}
    >
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
