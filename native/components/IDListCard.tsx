import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Card } from "./Card";
import { Typography } from "./Typography";

type IDListCardProps = {
  name: string;
  inventoryId: number;
  recordId: number;
  quantity: number;
  unit: string;
};

export const IDListCard = ({
  name,
  inventoryId,
  recordId,
  quantity,
  unit,
}: IDListCardProps) => {
  const styles = useStyles();
  const navigation = useNavigation();

  return (
    <Card
      color="mediumBlue"
      style={styles.card}
      padding="none"
      onPress={() =>
        navigation.navigate({
          name: "Record",
          params: { recordId, inventoryId },
        })
      }
    >
      <Typography
        color="darkBlue"
        variant={name.length > 15 ? "sBold" : "lBold"}
        numberOfLines={2}
      >
        {name}
      </Typography>
      <Typography
        color="darkBlue"
        variant={name.length > 15 ? "sBold" : "lBold"}
      >
        {quantity + " " + unit}
      </Typography>
    </Card>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 3,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
  })
);
