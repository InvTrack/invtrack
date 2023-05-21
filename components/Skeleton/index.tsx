import { createStyles } from "../../theme/useStyles";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ViewStyle,
  Platform,
  StyleSheet,
  StyleProp,
} from "react-native";

interface SkeletonProps {
  rounded?: "full" | number;
  style?: StyleProp<ViewStyle>;
}
const roundedFull = 99999;
const startOpacity = 0.1;
const endOpacity = 0.2;
const defaultRadius = 20;

/**
 * Special props:
 *
 * rounded (same as border radius) - "full" or a number, where full is a circle
 */
export const Skeleton = React.memo(({ rounded, style }: SkeletonProps) => {
  const styles = useStyles();
  const opacityRef = useRef(new Animated.Value(startOpacity));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityRef.current, {
          toValue: endOpacity,
          useNativeDriver: Platform.OS !== "web",
          duration: 500,
        }),
        Animated.timing(opacityRef.current, {
          toValue: startOpacity,
          useNativeDriver: Platform.OS !== "web",
          duration: 500,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.defaultSkeletonStyle,
        style,
        {
          opacity: opacityRef.current,
          borderRadius:
            rounded === "full" ? roundedFull : rounded ?? defaultRadius,
        },
      ]}
    />
  );
});

Skeleton.displayName = "Skeleton";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    defaultSkeletonStyle: {
      height: "100%",
      width: "100%",
      backgroundColor: theme.colors.white,
      borderRadius: defaultRadius,
    },
  })
);
