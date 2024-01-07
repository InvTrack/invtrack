import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";
import { InventoryIcon, ListIcon } from "../../components/Icon";

const TabLayout = () => {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.lightBlue,
          borderTopWidth: 1,
          borderTopColor: theme.colors.mediumBlue,
        },
      }}
    >
      <Tabs.Screen
        name="list"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <ListIcon color={focused ? "mediumBlue" : "darkBlue"} size={37} />
          ),
          headerShown: false,
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="inventory-[inventory_id]"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <InventoryIcon
              color={focused ? "mediumBlue" : "darkBlue"}
              size={37}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="delivery-[inventory_id]"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <InventoryIcon
              color={focused ? "mediumBlue" : "darkBlue"}
              size={37}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
