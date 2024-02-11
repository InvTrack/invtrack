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

import { Typography } from "../Typography";
import { useSnackbar } from "./context";
import { SnackbarItem } from "./types";

const ANIMATION_DURATION = 500;
const SNACKBAR_HEIGHT = 60;
const SNACKBAR_VISIBLE_FOR = 3000;
const OFFSET_Y = -SNACKBAR_HEIGHT * 2;

type SnackbarProps = {
  item: SnackbarItem;
};
/**
 * Can only be dismissed by swiping up, can only be swiped up. Covers the safearea insets.
 */
const Snackbar = ({ item }: SnackbarProps) => {
  const styles = useStyles();
  const timeout = useRef<NodeJS.Timeout>();
  const insets = useSafeAreaInsets();
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
      if (event.translationY < 0) {
        yOffset.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (yOffset.value < -5) {
        yOffset.value = withTiming(
          OFFSET_Y,
          { duration: ANIMATION_DURATION },
          () => {
            runOnJS(onHide)();
          }
        );
      }
    });
  useEffect(() => {
    yOffset.value = withTiming(0, {
      duration: ANIMATION_DURATION,
    });
  }, [yOffset]);

  useEffect(() => {
    // hide snackbar after some time
    timeout.current = setTimeout(() => {
      yOffset.value = withTiming(
        OFFSET_Y,
        { duration: ANIMATION_DURATION },
        () => {
          runOnJS(onHide)();
        }
      );
    }, SNACKBAR_VISIBLE_FOR + ANIMATION_DURATION);
  }, [dispatch, onHide, yOffset]);

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: (insets.top + SNACKBAR_HEIGHT) / 4,
            height: insets.top + SNACKBAR_HEIGHT,
          },
          styles[type],
          animatedStyle,
        ]}
      >
        <View style={styles.contentContainer}>
          <Typography style={styles.text}>{message}</Typography>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export const SnackbarRenderer = () => {
  const { state: items } = useSnackbar();
  //TODO: add a logger entry here
  return items
    .slice(0, 1)
    .map((item) => <Snackbar item={item} key={item.id} />);
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      ...theme.text.l,
      color: theme.colors.lightGrey,
      zIndex: 1000,
      position: "absolute",
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing * 2,
      borderBottomLeftRadius: theme.borderRadiusSmall,
      borderBottomRightRadius: theme.borderRadiusSmall,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
    },
    success: {
      backgroundColor: theme.colors.green,
    },
    error: {
      backgroundColor: theme.colors.red,
    },
    info: {
      backgroundColor: theme.colors.highlight,
    },
    text: {
      color: theme.colors.mediumBlue,
    },
  })
);
