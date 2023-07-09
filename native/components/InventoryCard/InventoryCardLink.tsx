import React from "react";
import { StyleSheet } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { SmallerArrowRightIcon } from "../Icon";
import { Typography } from "../Typography";

type InventoryCardAddProps = {
  title: string;
};

export const InventoryCardLink = ({ title }: InventoryCardAddProps) => {
  const styles = useStyles();
  return (
    <Card color="mediumBlue" style={styles.card} padding="none">
      <Typography color="darkBlue" variant="lBold">
        {title}
      </Typography>
      <SmallerArrowRightIcon size={25} />
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
