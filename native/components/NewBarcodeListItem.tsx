import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Card } from "./Card";
import { Typography } from "./Typography";

type NewBarcodeListItemProps = {
  name: string;
  inventoryId: number;
  highlighted: boolean;
};

export const NewBarcodeListItem = ({
  name,
  highlighted = false,
}: NewBarcodeListItemProps) => {
  const styles = useStyles();

  return (
    <Card
      color="mediumBlue"
      style={[styles.card, highlighted && styles.highlighted]}
      padding="none"
    >
      <Typography
        color="darkBlue"
        variant={name.length > 15 ? "sBold" : "lBold"}
        numberOfLines={2}
      >
        {name}
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
    highlighted: {
      borderColor: theme.colors.darkBlue,
      borderStyle: "solid",
      borderWidth: 2,
      marginLeft: -2,
    },
  })
);