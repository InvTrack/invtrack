import React from "react";
import { Animated } from "react-native";
import { TabBarStyle } from "./TabStyle";
import type { TabBarDotProps } from "./types";

// based on https://github.com/mikalyh/react-navigation-tabbar-collection?tab=MIT-1-ov-file#readme

export const TabBarDot = ({ color, scale = 1 }: TabBarDotProps) => {
  return (
    <Animated.View
      style={[
        TabBarStyle.itemDot,
        {
          backgroundColor: color,
          transform: [{ scale: scale }],
        },
      ]}
    />
  );
};
