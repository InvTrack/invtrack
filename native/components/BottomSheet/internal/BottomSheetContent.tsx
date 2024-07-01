import React, { forwardRef, RefObject, useEffect } from "react";
import {
  BackHandler,
  Keyboard,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  NativeViewGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { createStyles } from "../../../theme/useStyles";

interface Props {
  panRef: RefObject<PanGestureHandler>;
  scrollOffset: Animated.SharedValue<number>;
  Component: React.FC | null;
  onClose: (callback?: () => void) => void;
}

const BottomSheetContent = forwardRef(
  ({ scrollOffset, Component, onClose }: Props, ref) => {
    const styles = useStyles();
    const { height } = useWindowDimensions();
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
            style={{ maxHeight: height / 1.3 }}
            onScroll={scrollHandler}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            stickyHeaderIndices={[0]}
          >
            <View style={styles.top}>
              <View style={styles.thingy} />
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

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    top: {
      backgroundColor: theme.colors.darkBlue,
      borderTopRightRadius: 25,
      borderTopLeftRadius: 25,
    },
    thingy: {
      height: 6,
      width: 72,
      borderColor: "gray",
      borderWidth: 3,
      borderRadius: 99,
      alignSelf: "center",
      marginVertical: 8,
    },
  })
);
