import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { createStyles } from "../../theme/useStyles";
import { Card } from "../Card";
import { SmallerArrowRightIcon } from "../Icon";
import { Typography } from "../Typography";

type InventoryCardAddProps = {
  title: string;
  id: number;
  isDelivery: boolean;
};

export const ListCardLink = ({
  title,
  id,
  isDelivery,
}: InventoryCardAddProps) => {
  const styles = useStyles();
  const navigation = useNavigation();
  return (
    <Card
      color="mediumBlue"
      style={styles.card}
      padding="none"
      onPress={() => {
        navigation.navigate({
          name: isDelivery ? "DeliveryTab" : "InventoryTab",
          params: { id },
        });
      }}
    >
      <Typography
        color="darkBlue"
        variant={title.length > 15 ? "sBold" : "lBold"}
        numberOfLines={2}
      >
        {title}
      </Typography>
      <View
        style={
          isDelivery
            ? {
                backgroundColor: "green",
                borderRadius: 100,
                width: 20,
                height: 20,
              }
            : {
                backgroundColor: "red",
                borderRadius: 100,
                width: 20,
                height: 20,
              }
        }
      />
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
