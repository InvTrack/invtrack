import React from "react";
import { Animated } from "react-native";
import { CleanTabBarStyle } from "./TabStyle";
import type { TabBarDotProps } from "./types";

export const TabBarDot = ({ color, scale = 1 }: TabBarDotProps) => {
  return (
    <Animated.View
      style={[
        CleanTabBarStyle.itemDot,
        {
          backgroundColor: color,
          transform: [{ scale: scale }],
        },
      ]}
    />
  );
};
