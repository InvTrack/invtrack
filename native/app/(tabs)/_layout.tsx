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
        name="[inventory]"
        options={{
          tabBarLabel: "inventory",
          tabBarActiveTintColor: theme.colors.mediumBlue,
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
