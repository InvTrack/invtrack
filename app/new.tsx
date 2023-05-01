import React, { useState } from "react";
import { TextInput, View } from "react-native";

import { useCreateInventory } from "../db";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
export default function CreateInventory() {
  const [data, setData] = useState({
    name: "new inventory",
    date: "2023-02-06T00:00:00+00:00",
  });
  const { mutate, status } = useCreateInventory();
  return (
    <View>
      <Typography>Nazwa:</Typography>
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
      <Button type="primary" size="xl" onPress={() => mutate(data)}>
        <Typography>Stwórz inwentaryzację</Typography>
      </Button>
    </View>
  );
}
