import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { createStyles } from "../theme/useStyles";

interface SkeletonProps {
  borderRadius?: ViewStyle["borderRadius"];
  style?: StyleProp<ViewStyle>;
}

const startOpacity = 0.15;
const endOpacity = 0.25;
const defaultRadius = 25;

export const Skeleton = React.memo(({ borderRadius, style }: SkeletonProps) => {
  const styles = useStyles();
  const opacityRef = useRef(new Animated.Value(startOpacity));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityRef.current, {
          toValue: endOpacity,
          useNativeDriver: true,
          duration: 500,
        }),
        Animated.timing(opacityRef.current, {
          toValue: startOpacity,
          useNativeDriver: true,
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
          borderRadius: borderRadius || defaultRadius,
        },
      ]}
    />
  );
});

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    defaultSkeletonStyle: {
      height: "100%",
      width: "100%",
      backgroundColor: theme.colors.darkBlue,
    },
  })
);
