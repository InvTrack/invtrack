import React from "react";
import {
  Pressable,
  StyleSheet,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import debounce from "lodash/debounce";
import { createStyles } from "../../theme/useStyles";
import { TypographyProps } from "../Typography";

export type ButtonOnPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress?: ButtonOnPress;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  disabled?: boolean;
  type: "primary" | "secondary";
  size: "xs" | "s" | "m" | "l" | "xl";
  shadow?: boolean;
  children?: React.ReactNode;
};

const BORDER_WIDTH = 4;
const debouncedOnPress = (onPress: ButtonOnPress) => debounce(onPress, 50);

export const Button = ({
  onPress,
  containerStyle,
  // labelColor, TODO
  disabled = false,
  type,
  size,
  shadow = false,
  children,
}: ButtonProps) => {
  const styles = useStyles();

  return (
    <Pressable
      onPress={debouncedOnPress(onPress ?? (() => undefined))}
      style={[
        styles.buttonBase,
        styles[type],
        styles[size],
        shadow && styles.shadow,
        containerStyle,
      ]}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
};

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
