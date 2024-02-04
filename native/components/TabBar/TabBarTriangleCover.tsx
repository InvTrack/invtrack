import React from "react";
import { Animated, View } from "react-native";
import { CleanTabBarStyle } from "./TabStyle";
import type { TabBarTriangleProps } from "./types";

export const TabBarTriangleCover = ({
  color,
  style,
  translateY,
}: TabBarTriangleProps) => {
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          CleanTabBarStyle.triangleTop,
          {
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          CleanTabBarStyle.triangleBottom,
          {
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );
};
