import { Text } from "react-native-elements";
import React from "react";
import { View } from "../../../components/Themed";
import { Link, Stack, usePathname } from "expo-router";
import { useListRecords } from "../../../db";

export default function Inventory() {
  const pathName = usePathname();
  const inventoryId = pathName.split("/")[1];
  const { data, isSuccess } = useListRecords(inventoryId);
  if (!isSuccess || !data)
    return <Stack.Screen options={{ title: "Loading inventory" }} />;
  return (
    <>
      <Stack.Screen options={{ title: "Nazwa inwentaryzacji" }} />
      <View>
        <Text>Lista produktów</Text>
        {data.map(({ name, quantity, unit, id }) => {
          const quantityPostfix =
            (unit ? (quantity ? " - " + quantity + unit : null) : null) || "";
          return (
            <Link key={id} href={`${inventoryId}/${id}`}>
              <Text>{name + quantityPostfix}</Text>
            </Link>
          );
        })}
      </View>
    </>
  );
}
