import React from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { createStyles } from "../theme/useStyles";
import { LoadingSpinner } from "./LoadingSpinner";
import { Typography, TypographyProps } from "./Typography";

export const BUTTON_SIZE = {
  xs: 40,
  s: 48,
  m: 54,
  l: 58,
  xl: 58,
} as const;

export type ButtonOnPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress?: ButtonOnPress;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  disabled?: boolean;
  type: "primary" | "secondary";
  size: keyof typeof BUTTON_SIZE;
  shadow?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  isLoading?: boolean;
};

const BORDER_WIDTH = 2;

// weird, but needed to supress errors, related to keeping the event around in an async context
const debounceOnPress = (
  e: GestureResponderEvent,
  onPress: ButtonOnPress | undefined
) => {
  e.persist();
  return (onPress ?? (() => undefined))(e);
};

export const Button = ({
  onPress,
  containerStyle,
  labelStyle,
  disabled = false,
  type,
  size,
  shadow = false,
  fullWidth = false,
  children,
  isLoading = false,
}: ButtonProps) => {
  const styles = useStyles();
  const isStringChildren = typeof children === "string";
  return (
    <TouchableOpacity
      onPress={isLoading ? () => {} : (e) => debounceOnPress(e, onPress)}
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
      {isLoading ? (
        <LoadingSpinner />
      ) : isStringChildren ? (
        <Typography
          variant={size === "xs" ? "xs" : size === "s" ? "s" : "m"}
          style={[styles.string, labelStyle]}
        >
          {children}
        </Typography>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

Button.displayName = "Button";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    buttonBase: {
      margin: theme.spacing * 0.5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadiusSmall,
    },
    primary: {
      backgroundColor: theme.colors.darkBlue,
      borderColor: theme.colors.highlight,
      borderWidth: BORDER_WIDTH,
      padding: theme.spacing - BORDER_WIDTH,
    },
    secondary: {
      borderColor: theme.colors.lightBlue,
      borderWidth: BORDER_WIDTH,
      padding: theme.spacing - BORDER_WIDTH,
    },
    shadow: { ...theme.baseShadow },
    fullWidth: {
      width: "100%",
    },
    string: {
      color: theme.colors.lightGrey,
    },
    disabled: { opacity: 0.6 },
    // SIZES
    xs: {
      height: BUTTON_SIZE.xs,
      width: BUTTON_SIZE.xs,
      paddingHorizontal: 16,
    },
    s: {
      height: BUTTON_SIZE.s,
      width: BUTTON_SIZE.s,
      paddingHorizontal: 18,
    },
    m: {
      height: BUTTON_SIZE.m,
      width: BUTTON_SIZE.m,
      paddingHorizontal: 20,
    },
    l: {
      height: BUTTON_SIZE.l,
      width: BUTTON_SIZE.l,
    },
    xl: {
      height: BUTTON_SIZE.xl,
      width: BUTTON_SIZE.xl,
    },
  })
);
