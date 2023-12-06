import { Stack } from "expo-router";
import React from "react";
import { Typography } from "../../../components/Typography";
import { useListInventories } from "../../../db";

const InventoryLayout = () => {
  const { data } = useListInventories();

  const inventoryId = data?.[0]?.id;
  const noInventories = !data?.length;

  if (noInventories) return <Typography>Brak inwentaryzacji</Typography>;
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
      <Stack.Screen
        name="new_barcode"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default InventoryLayout;
