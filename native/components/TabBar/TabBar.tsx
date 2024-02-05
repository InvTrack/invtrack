import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomTabNavigatorScreen } from "../../navigation/types";
import { TabBarDot } from "./TabBarDot";
import { TabBarTriangleCover } from "./TabBarTriangleCover";
import { CleanTabBarStyle } from "./TabStyle";

export const CleanTabBar = (props: BottomTabBarProps) => {
  const theme = useTheme();
  const BACKGROUND_COLOR = theme.colors.mediumBlue;

  return (
    <SafeAreaView
      style={[
        CleanTabBarStyle.container,
        {
          backgroundColor: BACKGROUND_COLOR,
        },
      ]}
    >
      <View style={CleanTabBarStyle.content}>
        <CleanTabBarContent {...props} />
      </View>
    </SafeAreaView>
  );
};

export const CleanTabBarContent = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const theme = useTheme();
  const BACKGROUND_COLOR = theme.colors.mediumBlue;
  const FOREGROUND_COLOR = theme.colors.mediumBlue;

  return state.routes.map((route, index) => {
    const focusAnimation = useRef(new Animated.Value(0)).current;

    const { options } = descriptors[route.key as BottomTabNavigatorScreen];

    const label = options.title;
    const labelStyle =
      options.tabBarLabelStyle !== undefined ? options.tabBarLabelStyle : {};

    let color =
      options.tabBarActiveTintColor !== undefined
        ? options.tabBarActiveTintColor
        : theme.colors.darkBlue;

    const renderIcon = (focused: boolean) => {
      if (!options.tabBarIcon) {
        return <Text>No icon</Text>;
      }

      return options.tabBarIcon({
        focused,
        color: focused ? FOREGROUND_COLOR : FOREGROUND_COLOR,
        size: 23,
      });
    };

    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    };

    useEffect(() => {
      if (isFocused) {
        onFocusedAnimation();
      } else {
        notFocusedAnimation();
      }
    }, [isFocused]);

    const onFocusedAnimation = () => {
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      }).start();
    };

    const notFocusedAnimation = () => {
      Animated.timing(focusAnimation, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      }).start();
    };

    const translateYIcon = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -18],
    });
    const scaleIcon = focusAnimation.interpolate({
      inputRange: [0, 0.9, 1],
      outputRange: [1, 1, 0],
    });
    const translateYFilterIcon = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [20, -35],
    });
    const translateYText = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 0],
    });
    const scaleText = focusAnimation.interpolate({
      inputRange: [0, 0.1, 1],
      outputRange: [0, 1, 1],
    });
    const scaleDot = focusAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View key={index} style={CleanTabBarStyle.item}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          testID={options.tabBarTestID}
          onPress={onPress}
          onLongPress={onLongPress}
          style={CleanTabBarStyle.touchableItem}
        >
          <Animated.View
            style={[
              CleanTabBarStyle.itemIconLayer,
              {
                transform: [
                  { translateY: translateYIcon },
                  { scale: scaleIcon },
                ],
              },
            ]}
          >
            {renderIcon(isFocused)}
          </Animated.View>
          <TabBarTriangleCover
            color={BACKGROUND_COLOR}
            style={CleanTabBarStyle.filterIcon}
            translateY={translateYFilterIcon}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              CleanTabBarStyle.itemTextLayer,
              {
                transform: [
                  { translateY: translateYText },
                  { scale: scaleText },
                ],
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                CleanTabBarStyle.itemText,
                labelStyle,
                {
                  color: color,
                },
              ]}
            >
              {label}
            </Text>
          </Animated.View>
          <TabBarTriangleCover
            color={BACKGROUND_COLOR}
            style={CleanTabBarStyle.filterText}
            translateY={-5}
          />

          <TabBarDot color={color} scale={scaleDot} />
        </TouchableOpacity>
      </Animated.View>
    );
  });
};
