import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";

import { createStyles } from "../theme/useStyles";
import { Card } from "./Card";
import { Typography } from "./Typography";

type IDListCardProps = {
  name: string;
  id: number;
  recordId: number;
  quantity: number;
  unit: string;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
};

export const IDListCard = ({
  name,
  id,
  recordId,
  quantity,
  unit,
  borderLeft = false,
  borderRight = false,
  borderBottom = false,
}: IDListCardProps) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  return (
    <View
      style={[
        borderLeft ? styles.borderLeft : null,
        borderRight ? styles.borderRight : null,
        borderBottom ? styles.borderBottom : null,
      ]}
    >
      <Card
        color="mediumBlue"
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
          color="lightGrey"
          variant={
            name.length > 11 ? (name.length > 22 ? "xsBold" : "sBold") : "lBold"
          }
          numberOfLines={2}
          textProps={{ lineBreakMode: "tail", ellipsizeMode: "tail" }}
          style={styles.textLeft}
        >
          {name}
        </Typography>
        <Typography
          color="lightGrey"
          variant={"lBold"}
          style={styles.textRight}
        >
          {quantity + " " + unit}
        </Typography>
      </Card>
    </View>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    borderLeft: {
      paddingLeft: theme.spacing,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.highlight,
    },
    borderRight: {
      paddingRight: theme.spacing,
      borderRightWidth: 3,
      borderRightColor: theme.colors.highlight,
    },
    borderBottom: {
      paddingRight: 8,
      borderBottomWidth: 3,
      borderBottomColor: theme.colors.highlight,
      borderBottomLeftRadius: theme.borderRadiusSmall,
      borderBottomRightRadius: theme.borderRadiusSmall,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing,
      marginTop: theme.spacing,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
    textLeft: { flex: 1 },
    textRight: {
      marginLeft: theme.spacing,
    },
  })
);
