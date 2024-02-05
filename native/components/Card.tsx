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
}

export const Card = forwardRef(
  (
    {
      padding = "normal",
      fullWidth,
      children,
      style,
      color = "mediumBlue",
      borderTop = false,
      borderBottom = false,
      onPress,
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
            borderBottom && styles.borderBottom,
            borderTop && styles.borderTop,
            styles[padding],
            { backgroundColor: theme.colors[color] },
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          borderBottom && styles.borderBottom,
          borderTop && styles.borderTop,
          styles[padding],
          { backgroundColor: theme.colors[color] },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {children}
      </View>
    );
  }
);

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    borderTop: {
      borderTopLeftRadius: theme.borderRadius,
      borderTopRightRadius: theme.borderRadius,
    },
    borderBottom: {
      borderBottomLeftRadius: theme.borderRadius,
      borderBottomRightRadius: theme.borderRadius,
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
