import { Text } from "react-native-elements";
import React from "react";
import { View } from "../../components/Themed";
import { Link, Stack, useSegments } from "expo-router";

export default function Inventory() {
  const segments = useSegments();
  return (
    <>
      <Stack.Screen options={{ title: "Nazwa inwentaryzacji" }} />
      <View>
        <Text>Lista produktów</Text>
        <Link href={`${segments[0]}/prod1`}>
          <Text>Produkt 1</Text>
        </Link>
      </View>
    </>
  );
}
