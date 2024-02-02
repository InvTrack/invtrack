import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStyles } from "../../theme/useStyles";
import { useDimensions } from "../../utils/useDimensions";

import { Typography } from "../Typography";
import { useSnackbar } from "./context";
import { SnackbarProps } from "./types";

const DURATION = 1000;
const SNACKBAR_HEIGHT = 55;
const OFFSET_Y = -SNACKBAR_HEIGHT * 2;

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      zIndex: 1000,
      position: "absolute",
      // top: theme.spacing,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: SNACKBAR_HEIGHT,
      paddingHorizontal: theme.spacing * 2,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    success: {
      backgroundColor: theme.colors.green,
    },
    error: {
      backgroundColor: theme.colors.red,
    },
    info: {
      backgroundColor: theme.colors.grey,
    },
    text: {
      color: theme.colors.white,
    },
  })
);

const Snackbar = ({ item, index }: SnackbarProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const timeout = useRef<NodeJS.Timeout>();
  const insets = useSafeAreaInsets();
  const { width } = useDimensions();
  const { dispatch } = useSnackbar();

  const yOffset = useSharedValue(OFFSET_Y);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: yOffset.value }],
  }));

  const { id, type, message } = item;

  const onHide = () => {
    clearTimeout(timeout.current);
    dispatch({ type: "HIDE_SNACKBAR", payload: { id } });
  };

  const gestureHandler = Gesture.Pan()
    .onChange((event) => {
      yOffset.value = event.translationY + insets.top;
    })
    .onEnd(() => {
      if (yOffset.value > 5 || yOffset.value < -5) {
        yOffset.value = withTiming(OFFSET_Y, { duration: DURATION }, () => {
          runOnJS(onHide)();
        });
      }
    });
  useEffect(() => {
    yOffset.value = withTiming(
      insets.top + index * (SNACKBAR_HEIGHT + theme.spacing),
      {
        duration: DURATION,
      }
    );
  }, [index, insets.top, theme.spacing, yOffset]);

  useEffect(() => {
    // hide snackbar after some time
    timeout.current = setTimeout(() => {
      yOffset.value = withTiming(OFFSET_Y, { duration: DURATION }, () => {
        runOnJS(onHide)();
      });
    }, 1500 + DURATION);
  }, [dispatch, id, insets.top, onHide, width, yOffset]);

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View style={[styles.container, styles[type], animatedStyle]}>
        <View style={styles.contentContainer}>
          <Typography style={styles.text}>{message}</Typography>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export const SnackbarRenderer = () => {
  const { state: items } = useSnackbar();
  return items
    .slice(0, 1)
    .map((item, index) => <Snackbar item={item} index={index} key={item.id} />);
};
