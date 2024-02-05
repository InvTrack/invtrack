// import { Link } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Button } from "../Button";
import { PlusIcon } from "../Icon";

export const InventoryCardAdd = () => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  return (
    <Button
      // overriden in styles
      size="l"
      fullWidth
      type="primary"
      containerStyle={styles.plusCard}
      onPress={() => {
        navigation.navigate("NewStockScreen");
      }}
    >
      <PlusIcon size={25} color="darkGrey" />
    </Button>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    plusCard: {
      height: 45,
      borderRadius: theme.borderRadiusSmall,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: theme.spacing * 2,
    },
  })
);
