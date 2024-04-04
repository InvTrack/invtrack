import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { LayoutChangeEvent, StyleSheet, TouchableOpacity } from "react-native";
import {
  ComposedGesture,
  Gesture,
  GestureDetector,
  GestureType,
  NativeViewGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
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

const BottomSheet = () => {
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

  const panGestureHandler: ComposedGesture | GestureType = Gesture.Pan()
    .onChange((event) => {
      if (scrollOffset.value > 0) {
        return;
      }
      BottomSheetOffsetY.value = Math.max(0, event.translationY);
    })
    .onEnd(() => {
      if (BottomSheetOffsetY.value > BottomSheetHeight.value / 5) {
        onClose();
      } else {
        BottomSheetOffsetY.value = withTiming(0, { duration: 150 });
      }
    })
    .simultaneousWithExternalGesture(scrollRef);

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
      <Animated.View style={overlayStyle}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.absoluteFill, styles.overlay]}
          onPress={() => onClose()}
        />
      </Animated.View>
      <GestureDetector gesture={panGestureHandler}>
        <Animated.View style={bottomSheetStyle} onLayout={onLayout}>
          <BottomSheetContent
            // TODO: make the scroll handler defined here, then combine them to a race?
            // not sure yet
            ref={scrollRef}
            panRef={panRef}
            scrollOffset={scrollOffset}
            Component={content}
            onClose={onClose}
          />
        </Animated.View>
      </GestureDetector>
    </>
  ) : null;
};

export default BottomSheet;

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
