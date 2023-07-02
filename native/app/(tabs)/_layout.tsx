import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React from "react";

const TabLayout = () => {
  const theme = useTheme();
  return (
    <Tabs>
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarActiveTintColor: theme.colors.mediumBlue,
        }}
      />
      <Tabs.Screen
        name="Tab3"
        options={{
          tabBarLabel: "Tab2",
          tabBarActiveTintColor: theme.colors.mediumBlue,
        }}
      />
      <Tabs.Screen
        name="Tab2"
        options={{
          tabBarLabel: "Tab3",
          tabBarActiveTintColor: theme.colors.mediumBlue,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
