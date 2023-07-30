import React from "react";
import { View } from "react-native";

import { Link, usePathname } from "expo-router";
import { Typography } from "../../../../components/Typography";
import { useListRecords } from "../../../../db";
import { getLastElement } from "../../../../utils";

const getInventoryId = (pathName: string) =>
  +getLastElement(pathName.split("/"));

export default function InventoryIdIndex() {
  const pathName = usePathname();
  const inventoryId = getInventoryId(pathName);
  const { data, isSuccess } = useListRecords(inventoryId);

  if (!isSuccess || !data) return <Typography>Loading records</Typography>;

  return (
    <>
      <View>
        <Typography>Lista produktów</Typography>
        {data.map(({ name, quantity, unit, id }) => {
          const quantityPostfix =
            (unit ? (quantity ? " - " + quantity + unit : null) : null) || "";
          return (
            <Link
              key={id}
              href={{
                pathname: "/(tabs)/inventory/[inventory]/[record]",
                params: { inventory: inventoryId, record: id },
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
