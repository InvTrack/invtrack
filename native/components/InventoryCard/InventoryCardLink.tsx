import { Link } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { SmallerArrowRightIcon } from "../Icon";
import { Typography } from "../Typography";

type InventoryCardAddProps = {
  title: string;
  inventoryId: number;
};

export const InventoryCardLink = ({
  title,
  inventoryId,
}: InventoryCardAddProps) => {
  const styles = useStyles();

  return (
    <Link
      href={{
        pathname: `/(tabs)/inventory/[inventory]/`,
        params: { inventory: inventoryId },
      }}
      asChild
    >
      <Card color="mediumBlue" style={styles.card} padding="none">
        <Typography
          color="darkBlue"
          variant={title.length > 15 ? "sBold" : "lBold"}
          numberOfLines={2}
        >
          {title}
        </Typography>
        <SmallerArrowRightIcon size={25} />
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
