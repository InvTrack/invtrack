import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useFormContext } from "react-hook-form";
import { useGetRecord } from "../db";
import { useGetPreviousRecordQuantity } from "../db/hooks/useGetPreviousRecordQuantity";
import { createStyles } from "../theme/useStyles";
import { formatAndRoundFloat } from "../utils";
import { Card } from "./Card";
import { QuantityBadge } from "./QuantityBadge";
import { Typography } from "./Typography";

type IDListCardProps = {
  name: string | null | undefined;
  id: number;
  recordId: number;
  productId: number;
  inventoryId: number;
  quantity: number | null;
  unit: string;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
};
// TODO - to be refined
const getQuantityDelta = (
  currentQuantity: number | null | undefined,
  previousQuantity: number | null | undefined
): number | null => {
  if (currentQuantity == null && previousQuantity == null) return null;

  if (currentQuantity != null && previousQuantity == null)
    return formatAndRoundFloat(String(currentQuantity));

  if (currentQuantity == null && previousQuantity != null) return null;

  return formatAndRoundFloat(String(currentQuantity! - previousQuantity!));
};

export const IDListCard = ({
  name,
  id,
  recordId,
  productId,
  inventoryId,
  quantity,
  unit,
  borderLeft = false,
  borderRight = false,
  borderBottom = false,
}: IDListCardProps) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  const { data: originalRecord } = useGetRecord(recordId);
  const { data: previousQuantity } = useGetPreviousRecordQuantity(
    inventoryId,
    productId
  );
  const form = useFormContext();

  if (!name) {
    return null;
  }

  const wasQuantityChanged = previousQuantity === originalRecord?.quantity;
  const quantityDelta = useMemo(
    () =>
      getQuantityDelta(
        form.watch(`product_records.${recordId}`)?.quantity,
        wasQuantityChanged ? originalRecord?.quantity : previousQuantity
      ),
    [originalRecord?.quantity, previousQuantity, wasQuantityChanged]
  );

  return (
    <>
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
            variant={name.length > 22 ? (name.length > 35 ? "xs" : "s") : "l"}
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
            {(quantity === null ? "..." : quantity) + " " + unit}
          </Typography>
          {/* TODO - to be refined */}
          <QuantityBadge
            delta={quantityDelta}
            containerStyle={styles.previousQuantityBadge}
          />
        </Card>
      </View>
    </>
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
    previousQuantityBadge: {
      position: "absolute",
      right: 0,
      top: -10,
      zIndex: 10,
    },
  })
);
