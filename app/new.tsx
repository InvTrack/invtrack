import React, { useState } from "react";
import { TextInput } from "react-native";
import { Button } from "react-native-elements";
import { Text, View } from "../components/Themed";
import { useCreateInventory } from "../db";

export default function CreateInventory() {
  const [name, setName] = useState("");
  const { mutate, status } = useCreateInventory();
  return (
    <View>
      <Text>Nazwa:</Text>
      <TextInput
        style={{ borderColor: "#000000" }}
        onChangeText={(text) => setName(text)}
        value={name}
      />
      <Button
        onPress={() => mutate({ name })}
        title="Stwórz inwentaryzację"
      ></Button>
      <Text>Status: {status}</Text>
    </View>
  );
}
