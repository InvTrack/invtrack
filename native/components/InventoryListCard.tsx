import { Link } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../theme/useStyles";
import { Card } from "./Card";
import { Typography } from "./Typography";

type InventoryListCardProps = {
  name: string;
  inventoryId: number;
  recordId: number;
  quantity: number;
  unit: string;
};

export const InventoryListCard = ({
  name,
  inventoryId,
  recordId,
  quantity,
  unit,
}: InventoryListCardProps) => {
  const styles = useStyles();

  return (
    <Link
      href={{
        pathname: "/(tabs)/inventory-[inventory_id]/[record]",
        params: { inventory: inventoryId, record: recordId },
      }}
      asChild
    >
      <Card color="mediumBlue" style={styles.card} padding="none">
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
    </Link>
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
