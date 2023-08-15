import { Tabs } from "expo-router";
import React from "react";
import { InventoryIcon, ListIcon } from "../../components/Icon";

const TabLayout = () => {
  return (
    <Tabs>
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
        name="[inventory]"
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
