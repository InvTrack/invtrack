import debounce from "lodash/debounce";
import React, { forwardRef } from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { createStyles } from "../theme/useStyles";
import { Typography, TypographyProps } from "./Typography";

export type ButtonOnPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress?: ButtonOnPress;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  disabled?: boolean;
  type: "primary" | "secondary";
  size: "xs" | "s" | "m" | "l" | "xl";
  shadow?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
};

const BORDER_WIDTH = 4;
const debouncedOnPress = (onPress: ButtonOnPress) => debounce(onPress, 50);

export const Button = forwardRef(
  (
    {
      onPress,
      containerStyle,
      // labelColor, TODO
      disabled = false,
      type,
      size,
      shadow = false,
      fullWidth = false,
      children,
    }: ButtonProps,
    _ref
  ) => {
    const styles = useStyles();
    const isStringChildren = typeof children === "string";
    return (
      <TouchableOpacity
        onPress={debouncedOnPress(onPress ?? (() => undefined))}
        style={[
          styles.buttonBase,
          styles[type],
          styles[size],
          disabled && styles.disabled,
          shadow && styles.shadow,
          fullWidth && styles.fullWidth,
          containerStyle,
        ]}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {isStringChildren ? (
          <Typography variant={size === "xs" ? "s" : "m"} style={styles.string}>
            {children}
          </Typography>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    buttonBase: {
      margin: theme.spacing * 0.5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadiusFull,
    },
    primary: {
      backgroundColor: theme.colors.mediumBlue,
      padding: theme.spacing,
    },
    secondary: {
      borderColor: theme.colors.mediumBlue,
      borderWidth: BORDER_WIDTH,
      padding: theme.spacing - BORDER_WIDTH,
    },
    shadow: { ...theme.baseShadow },
    fullWidth: {
      width: "100%",
    },
    string: {
      color: theme.colors.darkBlue,
    },
    disabled: { opacity: 0.6 },
    // SIZES
    xs: {
      height: 40,
      width: 40,
      paddingHorizontal: 16,
    },
    s: {
      height: 48,
      width: 48,
      paddingHorizontal: 18,
    },
    m: {
      height: 54,
      width: 54,
      paddingHorizontal: 20,
    },
    l: {
      height: 58,
      width: 58,
    },
    xl: {
      height: 58,
      width: 58,
    },
  })
);
