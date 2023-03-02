import { Button, Text } from "react-native-elements";
import React from "react";
import { Link, Stack } from "expo-router";
import { View } from "../components/Themed";

export default function Calendar() {
  return (
    <>
      <Stack.Screen options={{ title: "Kalendarz" }} />
      <View>
        <Text>Lista inwentaryzacji</Text>
        <Link href="./inv1">
          <Text>inw 1</Text>
        </Link>
        <Button title="Dodaj inwentaryzację"></Button>
      </View>
    </>
  );
}
