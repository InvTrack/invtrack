import React from "react";
import { View } from "react-native";

import { Link, useLocalSearchParams } from "expo-router";
import { Typography } from "../../../../components/Typography";
import { useListRecords } from "../../../../db";

export default function InventoryIdIndex() {
  const { inventory: inventoryId } = useLocalSearchParams();

  const { data, isSuccess } = useListRecords(+inventoryId);

  if (!isSuccess || !data) return <Typography>Loading records</Typography>;

  return (
    <>
      <View>
        <Typography>Lista produktów</Typography>
        {data.map(({ name, quantity, unit, id }) => {
          if (id === null) {
            return <Typography>Loading</Typography>;
          }
          const quantityPostfix =
            (unit ? (quantity ? " - " + quantity + unit : null) : null) || "";
          return (
            <Link
              key={id}
              href={{
                pathname: "/(tabs)/inventory/[inventory]/[record]",
                params: { inventory: +inventoryId, record: id },
              }}
            >
              <Typography>{name + quantityPostfix}</Typography>
            </Link>
          );
        })}
      </View>
    </>
  );
}
