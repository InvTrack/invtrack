import { MutableRefObject } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "../../theme/useStyles";
import { TRACER_SIZE, interpolatableX, interpolatableY } from "./common";

interface BarcodeOutlineProps {
  animatedTLCornerX: MutableRefObject<Animated.Value>;
  animatedTLCornerY: MutableRefObject<Animated.Value>;
  animatedBLCornerX: MutableRefObject<Animated.Value>;
  animatedBLCornerY: MutableRefObject<Animated.Value>;
  animatedBRCornerX: MutableRefObject<Animated.Value>;
  animatedBRCornerY: MutableRefObject<Animated.Value>;
  animatedTRCornerX: MutableRefObject<Animated.Value>;
  animatedTRCornerY: MutableRefObject<Animated.Value>;
}
export const BarcodeOutline = ({
  animatedTLCornerX,
  animatedTLCornerY,
  animatedBLCornerX,
  animatedBLCornerY,
  animatedBRCornerX,
  animatedBRCornerY,
  animatedTRCornerX,
  animatedTRCornerY,
}: BarcodeOutlineProps) => {
  const { width, height } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();

  const styles = useStyles();
  const interpolateX = interpolatableX(height, topInset);
  const interpolateY = interpolatableY(width);

  return (
    <View style={[styles.outlineContainer]}>
      {/* top left */}
      <Animated.View
        style={[
          styles.outlinePoint,
          {
            transform: [
              {
                translateY: interpolateX(animatedTLCornerX.current),
              },
              { translateX: interpolateY(animatedTLCornerY.current) },
            ],
          },
        ]}
      />
      {/* bottom left */}
      <Animated.View
        style={[
          styles.outlinePoint,
          {
            transform: [
              {
                translateY: interpolateX(animatedBLCornerX.current),
              },
              { translateX: interpolateY(animatedBLCornerY.current) },
            ],
          },
        ]}
      />
      {/* bottom right */}
      <Animated.View
        style={[
          styles.outlinePoint,
          {
            transform: [
              {
                translateY: interpolateX(animatedBRCornerX.current),
              },
              { translateX: interpolateY(animatedBRCornerY.current) },
            ],
          },
        ]}
      />
      {/* top right */}
      <Animated.View
        style={[
          styles.outlinePoint,
          {
            transform: [
              {
                translateY: interpolateX(animatedTRCornerX.current),
              },
              { translateX: interpolateY(animatedTRCornerY.current) },
            ],
          },
        ]}
      />
    </View>
  );
};
const useStyles = createStyles((theme) =>
  StyleSheet.create({
    outlineContainer: {
      position: "absolute",
    },
    outlinePoint: {
      position: "absolute",
      width: TRACER_SIZE,
      height: TRACER_SIZE,
      backgroundColor: "rgba(0, 0, 0,1)",
      justifyContent: "center",
      borderRadius: theme.borderRadiusFull,
    },
  })
);
