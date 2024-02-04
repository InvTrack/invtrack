import type {
  AnimatableNumericValue,
  StyleProp,
  ViewStyle,
} from "react-native";

export type TabBarTriangleProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
  translateY: AnimatableNumericValue;
};

export type TabBarDotProps = {
  color?: string;
  scale?: AnimatableNumericValue;
};
