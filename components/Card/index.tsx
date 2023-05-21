import { ThemeColors } from "../../theme";
import { createStyles } from "../../theme/useStyles";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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
    black: { backgroundColor: theme.colors.black },
    white: { backgroundColor: theme.colors.white },
    lightBlue: { backgroundColor: theme.colors.lightBlue },
    mediumBlue: { backgroundColor: theme.colors.mediumBlue },
    darkBlue: { backgroundColor: theme.colors.darkBlue },
  })
);

export const Card = ({
  padding = "normal",
  fullWidth,
  children,
  style,
  color = "mediumBlue",
  borderTop = false,
  borderBottom = false,
  onPress,
}: CardProps) => {
  const styles = useStyles();

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          borderBottom && styles.borderBottom,
          borderTop && styles.borderTop,
          styles[padding],
          styles[color],
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
        styles[color],
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {children}
    </View>
  );
};
