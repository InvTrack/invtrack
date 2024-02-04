import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";

import { createStyles } from "../theme/useStyles";
import { Card } from "./Card";
import { Typography } from "./Typography";

type IDListCardProps = {
  name: string;
  id: number;
  recordId: number;
  quantity: number;
  unit: string;
};

export const IDListCard = ({
  name,
  id,
  recordId,
  quantity,
  unit,
}: IDListCardProps) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  return (
    <Card
      color="new_mediumBlue"
      style={styles.card}
      padding="none"
      onPress={() =>
        // bypass screen type check, handled by either (Inventory || Delivery)TabScreen navigator,
        // no need to specify, as they both contain the Record route, with these params
        navigation.navigate("RecordScreen", {
          recordId,
          id,
        })
      }
    >
      <Typography
        color="new_darkGrey"
        variant={name.length > 15 ? "sBold" : "lBold"}
        numberOfLines={2}
      >
        {name}
      </Typography>
      <Typography
        color="new_darkGrey"
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
