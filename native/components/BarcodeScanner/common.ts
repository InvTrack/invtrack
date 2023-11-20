import { Animated } from "react-native";

export const TRACER_SIZE = 10;
export const TOP_BAR_HEIGHT = 56;

export const interpolatableX =
  (height: number, topInset: number) => (x: Animated.Value) => {
    return x.interpolate({
      inputRange: [0, 1],
      outputRange: [0, height - TOP_BAR_HEIGHT - topInset],
    });
  };

export const interpolatableY = (width: number) => (y: Animated.Value) =>
  y.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });
