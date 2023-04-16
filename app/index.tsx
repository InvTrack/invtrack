import { Button, Text } from "react-native-elements";
import React from "react";
import { Link, Stack } from "expo-router";
import { View } from "../components/Themed";
import { useListInventories } from "../db";

export default function Calendar() {
  const { data: inventories, isLoading } = useListInventories();
  if (isLoading || !inventories)
    return <Stack.Screen options={{ title: "Loading" }} />;
  return (
    <>
      <Stack.Screen options={{ title: "Kalendarz" }} />
      <View>
        <Text>Lista inwentaryzacji</Text>
        {inventories.map(({ id, name }) => (
          <Link href={"./" + id} key={id}>
            <Text>{name}</Text>
          </Link>
        ))}
        <Link href={"/new"}>
          <Button title="Dodaj inwentaryzację"></Button>
        </Link>
      </View>
    </>
  );
}
