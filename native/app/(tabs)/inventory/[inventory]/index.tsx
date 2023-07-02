import React from "react";
import { View } from "react-native";

import { Typography } from "../../../../components/Typography";
import { useListRecords } from "../../../../db";
const { Link, Stack, usePathname } = require("expo-router");

const getInventoryId = (pathName: string) => pathName.split("/")[2];

export default function InventoryIdIndex() {
  const pathName = usePathname();
  const inventoryId = getInventoryId(pathName);
  const { data, isSuccess } = useListRecords(inventoryId);

  if (!isSuccess || !data)
    return <Stack.Screen options={{ title: "Loading inventory" }} />;

  return (
    <>
      <Stack.Screen options={{ title: "Nazwa inwentaryzacji" }} />
      <View>
        <Typography>Lista produktów</Typography>
        {data.map(({ name, quantity, unit, id }) => {
          const quantityPostfix =
            (unit ? (quantity ? " - " + quantity + unit : null) : null) || "";
          return (
            <Link
              key={id}
              href={{
                pathname: "/(tabs)/inventory/[inventory]/[product]",
                params: { inventory: inventoryId, product: id },
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
