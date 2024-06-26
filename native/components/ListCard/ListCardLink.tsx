import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import {
  DeliveryTabNavigationProp,
  InventoryTabNavigationProp,
} from "../../navigation/types";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { SmallerArrowRightIcon } from "../Icon";
import { Typography } from "../Typography";

type ListCardAddProps = {
  title: string | undefined;
  id: number;
  isDelivery: boolean;
};

const navigateToTabScreen =
  (navigation: any, id: number, isDelivery: boolean) => () => {
    if (isDelivery) {
      (navigation as DeliveryTabNavigationProp).navigate("DeliveryTabScreen", {
        id,
      });
      return;
    }
    (navigation as InventoryTabNavigationProp).navigate("InventoryTabScreen", {
      id,
    });
    return;
  };

export const ListCardLink = ({ title, id, isDelivery }: ListCardAddProps) => {
  const styles = useStyles();
  const navigation = useNavigation();
  return (
    <Card
      color="mediumBlue"
      style={styles.card}
      padding="none"
      badge={isDelivery ? "green" : "red"}
      onPress={navigateToTabScreen(navigation, id, isDelivery)}
    >
      <Typography
        color="lightGrey"
        variant={
          (title?.length ?? 0) > 22
            ? title?.length ?? 0 > 44
              ? "xs"
              : "s"
            : "l"
        }
        numberOfLines={2}
        textProps={{ lineBreakMode: "tail", ellipsizeMode: "tail" }}
        style={styles.text}
      >
        {title}
      </Typography>
      <SmallerArrowRightIcon size={25} color="highlight" style={styles.arrow} />
    </Card>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing * 2,
      paddingRight: theme.spacing * 2,
      marginBottom: theme.spacing * 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
    text: {
      flex: 1,
    },
    arrow: { marginLeft: theme.spacing },
  })
);
