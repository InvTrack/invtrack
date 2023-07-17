import React, { forwardRef, RefObject, useEffect } from "react";
import { BackHandler, Keyboard, View } from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

interface Props {
  panRef: RefObject<PanGestureHandler>;
  scrollOffset: Animated.SharedValue<number>;
  Component: React.FC | null;
  onClose: (callback?: () => void) => void;
}

const BottomSheetContent = forwardRef(
  ({ scrollOffset, Component, onClose }: Props, ref) => {
    const scrollHandler = useAnimatedScrollHandler((e) => {
      scrollOffset.value = e.contentOffset.y;
    });

    useEffect(() => {
      Keyboard.dismiss();
      const backAction = () => {
        onClose();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => {
        backHandler.remove();
      };
    }, [onClose]);

    if (Component) {
      return (
        <NativeViewGestureHandler ref={ref}>
          <Animated.ScrollView
            onScroll={scrollHandler}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
          >
            {/* TODO THEMING!! */}
            <View
              style={{
                backgroundColor: "white",
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
              }}
            >
              <View
                style={{
                  height: 6,
                  width: 72,
                  borderColor: "gray",
                  borderWidth: 3,
                  borderRadius: 99,
                  alignSelf: "center",
                  marginVertical: 8,
                }}
              />
            </View>
            <Component />
          </Animated.ScrollView>
        </NativeViewGestureHandler>
      );
    }

    return null;
  }
);
export default BottomSheetContent;
