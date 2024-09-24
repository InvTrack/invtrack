import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { QuantityBadge } from "../../../components/QuantityBadge";
import { Card } from "../../../components/common/Card";
import { Typography } from "../../../components/common/Typography";
import { useGetRecord } from "../../../db";
import { useGetPreviousRecordQuantity } from "../../../db/hooks/useGetPreviousRecordQuantity";
import { createStyles } from "../../../theme/useStyles";
import { formatAndRoundFloat } from "../../../utils";
import { useStockContext } from "../StockContext/StockContextProvider";

type IDListCardProps = {
  name: string | null | undefined;
  id: number;
  recordId: number;
  productId: number;
  inventoryId: number;
  quantity: number | null;
  documents: (number | null)[];
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
  documents,
  unit,
  borderLeft = false,
  borderRight = false,
  borderBottom = false,
}: IDListCardProps) => {
  const styles = useStyles();
  const navigation = useNavigation<any>();
  const { data: originalRecord } = useGetRecord(inventoryId, productId);
  const { data: previousQuantity } = useGetPreviousRecordQuantity(
    inventoryId,
    productId
  );
  const stock = useStockContext();

  const documentsLength = documents.length;

  if (!name) {
    return null;
  }

  const wasQuantityChanged = previousQuantity === originalRecord?.quantity;
  const quantityDelta = useMemo(
    () =>
      getQuantityDelta(
        stock.productRecords[productId]?.quantity,
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
            navigation.navigate("RecordScreen", {
              recordId,
              productId,
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
          {documentsLength > 0 ? (
            <Typography
              color="lightGrey"
              variant={"lBold"}
              style={{ flex: 1, borderRightWidth: 1, textAlign: "center" }}
            >
              {quantity === null ? "..." : quantity}
            </Typography>
          ) : null}
          {documents.map((q) => (
            <Typography
              color="lightGrey"
              variant={"lBold"}
              style={{ flex: 1, borderRightWidth: 1, textAlign: "center" }}
            >
              {q === null ? "" : q}
            </Typography>
          ))}
          <Typography
            color="lightGrey"
            variant={"lBold"}
            style={styles.textRight}
          >
            {documents.reduce((x, a) => (x || 0) + (a || 0), quantity || 0) +
              " " +
              unit}
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

export const IDListCardHeader = ({ documents }: { documents: any[] }) => {
  const styles = useStyles();

  const documentsLength = documents.length;

  return (
    <>
      <View>
        <Card color="mediumBlue" style={styles.card} padding="none">
          <Typography
            color="lightGrey"
            variant="l"
            numberOfLines={2}
            textProps={{ lineBreakMode: "tail", ellipsizeMode: "tail" }}
            style={styles.textLeft}
          >
            Nazwa
          </Typography>
          {documentsLength > 0 ? (
            <Typography
              color="lightGrey"
              variant={"lBold"}
              style={{ flex: 1, borderRightWidth: 1, textAlign: "center" }}
            >
              Ilość
            </Typography>
          ) : null}
          {documents.map((_, i) => (
            <Typography
              color="lightGrey"
              variant={"lBold"}
              style={{ flex: 1, borderRightWidth: 1, textAlign: "center" }}
            >
              Dok. {i + 1}
            </Typography>
          ))}
          <Typography
            color="lightGrey"
            variant={"lBold"}
            style={styles.textRight}
          >
            {documentsLength > 0 ? "Suma" : "Ilość"}
          </Typography>
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
      marginBottom: 2,
      marginTop: 2,
      height: 45,
      borderRadius: theme.borderRadiusSmall,
    },
    textLeft: { flex: 2 },
    textRight: {
      flex: 1,
      marginLeft: theme.spacing,
      textAlign: "center",
    },
    previousQuantityBadge: {
      position: "absolute",
      right: 0,
      top: -10,
      zIndex: 10,
    },
  })
);
