import { Stack } from "expo-router";
import React from "react";

const InventoryLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[inventory]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default InventoryLayout;