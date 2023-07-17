import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { createStyles } from "../../theme/useStyles";
import { useDimensions } from "../../utils/useDimensions";
import BottomSheetContent from "./internal/BottomSheetContent";
import { useInternalBottomSheet } from "./internal/useInternalBottomSheet";

export const BOTTOMSHEET_TIMING_CLOSE = 250;

const useStyles = createStyles(() =>
  StyleSheet.create({
    absoluteFill: StyleSheet.absoluteFillObject,
    overlay: {
      backgroundColor: "black",
    },
    bottomSheet: {
      position: "absolute",
      left: 0,
      bottom: 0,
      right: 0,
    },
  })
);

const BottomSheet = () => {
  const theme = useTheme();
  const styles = useStyles();
  const { height: screenHeight } = useDimensions();
  const {
    replaceBottomSheet,
    isOpen,
    showBottomSheet,
    resetBottomSheet,
    content,
    newContent,
  } = useInternalBottomSheet();

  const panRef = useRef<PanGestureHandler>(null);
  const scrollRef = useRef<NativeViewGestureHandler>(null);

  const BottomSheetHeight = useSharedValue(0);
  const BottomSheetOffsetY = useSharedValue(screenHeight);
  const scrollOffset = useSharedValue(0);

  // Styling
  const animatedBottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: BottomSheetOffsetY.value }],
  }));
  const bottomSheetStyle = useMemo(
    () => [
      styles.bottomSheet,
      {
        maxHeight: screenHeight * 0.9,
      },
      animatedBottomSheetStyle,
    ],
    [animatedBottomSheetStyle, screenHeight, styles.bottomSheet]
  );
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity:
      BottomSheetHeight.value > 0
        ? interpolate(
            BottomSheetOffsetY.value,
            [0, BottomSheetHeight.value],
            [0.8, 0]
          )
        : 0,
  }));
  const overlayStyle = useMemo(
    () => [styles.absoluteFill, animatedOverlayStyle],
    [animatedOverlayStyle, styles.absoluteFill]
  );

  // Reset the BottomSheet
  const onReset = useCallback(() => {
    resetBottomSheet();
  }, [resetBottomSheet]);

  // Close animation
  const onClose = useCallback(
    (successCallback?: () => void) => {
      "worklet";
      BottomSheetOffsetY.value = withSequence(
        withTiming(
          BottomSheetHeight.value,
          { duration: BOTTOMSHEET_TIMING_CLOSE },
          () => {
            BottomSheetHeight.value = 0;
            typeof successCallback === "function"
              ? runOnJS(successCallback)()
              : runOnJS(onReset)();
          }
        ),
        withTiming(screenHeight, { duration: 0 })
      );
    },
    [BottomSheetHeight, BottomSheetOffsetY, onReset, screenHeight]
  );

  // Opening animation
  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (BottomSheetHeight.value === height) {
      return;
    }
    BottomSheetHeight.value = height;
    BottomSheetOffsetY.value = withSequence(
      withTiming(height, { duration: 0 }),
      withTiming(0, { duration: 250 })
    );
  };

  // RNGH handlers
  const panGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { offsetY: number }
  >({
    onStart: (_, ctx) => {
      ctx.offsetY = 0;
    },
    onActive: (event, ctx) => {
      if (scrollOffset.value > 0) {
        ctx.offsetY = event.translationY;
        return;
      }
      BottomSheetOffsetY.value = Math.max(0, event.translationY - ctx.offsetY);
    },
    onEnd: () => {
      if (BottomSheetOffsetY.value > BottomSheetHeight.value / 2) {
        onClose();
      } else {
        BottomSheetOffsetY.value = withTiming(0, { duration: 150 });
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (newContent) {
      onClose(replaceBottomSheet);
    }
  }, [newContent, onClose, replaceBottomSheet]);

  return showBottomSheet ? (
    <>
      <StatusBar backgroundColor={theme.colors.transparent} />
      <Animated.View style={overlayStyle}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.absoluteFill, styles.overlay]}
          onPress={() => onClose()}
        />
      </Animated.View>
      <PanGestureHandler
        onGestureEvent={panGestureHandler}
        ref={panRef}
        simultaneousHandlers={scrollRef}
      >
        <Animated.View style={bottomSheetStyle} onLayout={onLayout}>
          <BottomSheetContent
            ref={scrollRef}
            panRef={panRef}
            scrollOffset={scrollOffset}
            Component={content}
            onClose={onClose}
          />
        </Animated.View>
      </PanGestureHandler>
    </>
  ) : null;
};

export default BottomSheet;
