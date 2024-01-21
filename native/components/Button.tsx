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

const BORDER_WIDTH = 4;

// weird, but needed to supress errors, related to keeping the event around in an async context
const debounceOnPress = (
  e: GestureResponderEvent,
  onPress: ButtonOnPress | undefined
) => {
  e.persist();
  return debounce(onPress ?? (() => undefined), 50)(e);
};

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
      isLoading = false,
    }: ButtonProps,
    _ref
  ) => {
    const styles = useStyles();
    const isStringChildren = typeof children === "string";
    return (
      <TouchableOpacity
        onPress={(e) => debounceOnPress(e, onPress)}
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
