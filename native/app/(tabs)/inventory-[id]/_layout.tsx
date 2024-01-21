import { Stack } from "expo-router";
import React from "react";
import { InventoryFormContextProvider } from "../../../components/InventoryFormContext/InventoryFormContextProvider";
import { Typography } from "../../../components/Typography";
import { useListInventories } from "../../../db";

const InventoryLayout = () => {
  const { data } = useListInventories();

  const id = data?.find((item) => !item.is_delivery)?.id;

  const noInventories = !data?.length;

  if (noInventories) return <Typography>Brak inwentaryzacji</Typography>;
  // TODO skeletons or ???
  if (!id) return <Typography>Brak inwentaryzacji</Typography>;

  return (
    <InventoryFormContextProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
          initialParams={{ id }}
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
    </InventoryFormContextProvider>
  );
};

export default InventoryLayout;
