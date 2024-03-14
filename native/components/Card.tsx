import React, { forwardRef } from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "@react-navigation/native";
import { ThemeColors } from "../theme";
import { createStyles } from "../theme/useStyles";

type CardPaddings = "none" | "dense" | "normal";

interface CardProps {
  padding?: CardPaddings;
  fullWidth?: boolean;
  children: React.ReactNode;
  color?: ThemeColors;
  style?: StyleProp<ViewStyle>;
  borderTop?: boolean;
  borderBottom?: boolean;
  onPress?: () => void;
  badge?: "red" | "green";
}

export const Card = forwardRef(
  (
    {
      padding = "normal",
      fullWidth,
      children,
      style,
      color = "mediumBlue",
      onPress,
      badge,
    }: CardProps,
    _ref
  ) => {
    const theme = useTheme();
    const styles = useStyles();
    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          style={[
            styles[padding],
            { backgroundColor: theme.colors[color] },
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {badge && (
            <View
              style={[{ backgroundColor: theme.colors[badge] }, styles.badge]}
            />
          )}
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          styles[padding],
          { backgroundColor: theme.colors[color] },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {badge && (
          <View
            style={[{ backgroundColor: theme.colors[badge] }, styles.badge]}
          />
        )}
        {children}
      </View>
    );
  }
);

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    // badge: {
    //   position: "absolute",
    //   overflow: "hidden",
    //   backgroundColor: theme.colors.red,
    //   top: -2,
    //   left: -2,
    //   width: 12,
    //   height: 12,
    //   borderRadius: theme.borderRadius,
    // },
    badge: {
      position: "absolute",
      height: "100%",
      width: 5,
      left: 0,
      borderTopStartRadius: theme.borderRadiusSmall,
      borderBottomStartRadius: theme.borderRadiusSmall,
    },
    none: {
      padding: 0,
    },
    dense: {
      padding: theme.spacing * 1.5,
    },
    normal: {
      padding: theme.spacing * 2,
    },
    fullWidth: {
      width: "100%",
    },
  })
);
