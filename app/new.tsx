import React, { useState } from "react";
import { TextInput } from "react-native";
import { Button } from "react-native-elements";
import { Text, View } from "../components/Themed";
import { useCreateInventory } from "../db";

export default function CreateInventory() {
  const [data, setData] = useState({
    name: "new inventory",
    date: "2023-02-06T00:00:00+00:00",
  });
  const { mutate, status } = useCreateInventory();
  return (
    <View>
      <Text>Nazwa:</Text>
      <TextInput
        style={{ borderColor: "#000000" }}
        onChangeText={(text) => setData((d) => ({ ...d, name: text }))}
        value={data.name}
      />
      <TextInput
        style={{ borderColor: "#000000" }}
        onChangeText={(text) => setData((d) => ({ ...d, date: text }))}
        value={data.date}
      />
      <Button
        onPress={() => mutate(data)}
        title="Stwórz inwentaryzację"
      ></Button>
      <Text>Status: {status}</Text>
    </View>
  );
}
