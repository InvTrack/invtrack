import { Stack } from "expo-router";
import React from "react";
import { useListInventories } from "../../../db";

const InventoryLayout = () => {
  const { data } = useListInventories();
  const inventoryId = data?.[0].id;
  // TODO skeletons or ???
  if (!inventoryId) return null;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
        initialParams={{ inventory: inventoryId }}
      />
      <Stack.Screen
        name="[record]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default InventoryLayout;
