import React from "react";
import { Animated, View } from "react-native";
import { TabBarStyle } from "./TabStyle";
import type { TabBarTriangleProps } from "./types";

// based on https://github.com/mikalyh/react-navigation-tabbar-collection?tab=MIT-1-ov-file#readme

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
          TabBarStyle.triangleTop,
          {
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          TabBarStyle.triangleBottom,
          {
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );
};
