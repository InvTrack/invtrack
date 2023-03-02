import { Text } from "react-native-elements";
import React from "react";
import { View } from "../../components/Themed";
import { Stack } from "expo-router";

export default function Product() {
  return (
    <>
      <Stack.Screen options={{ title: "Nazwa produktu" }} />
      <View>
        <Text>Karta produktu</Text>
      </View>
    </>
  );
}
