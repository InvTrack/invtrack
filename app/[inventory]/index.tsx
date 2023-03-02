import { Text } from "react-native-elements";
import React from "react";
import { View } from "../../components/Themed";
import { Link, Stack, usePathname } from "expo-router";
import { useListProductQuantities, useListProducts } from "../../db";

export default function Inventory() {
  const pathName = usePathname();
  const inventoryId = pathName.split("/")[1];
  // TODO optimize into single query
  const { data: productQuantities } = useListProductQuantities(inventoryId);
  const { data: products, isSuccess } = useListProducts();
  if (!isSuccess) return null;
  return (
    <>
      <Stack.Screen options={{ title: "Nazwa inwentaryzacji" }} />
      <View>
        <Text>Lista produktów</Text>
        {products?.map(({ id, name, unit }) => {
          const quantity = productQuantities?.find(
            (q) => q.product_id === id
          )?.quantity;
          return (
            <Link key={id} href={`${inventoryId}/${id}`}>
              <Text>
                {name} : {quantity ? quantity + unit : null}
              </Text>
            </Link>
          );
        })}
      </View>
    </>
  );
}
