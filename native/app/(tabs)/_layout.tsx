import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {
  const theme = useTheme();
  return (
    <Tabs>
      <Tabs.Screen
        name="list"
        options={{
          tabBarLabel: "list",
          tabBarActiveTintColor: theme.colors.mediumBlue,
          headerShown: false,
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarActiveTintColor: theme.colors.mediumBlue,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Tab3"
        options={{
          tabBarLabel: "Tab3",
          tabBarActiveTintColor: theme.colors.mediumBlue,
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
