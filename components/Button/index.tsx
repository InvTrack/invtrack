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
import { Typography, TypographyProps } from "../Typography";

type onPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress?: onPress;
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  disabled?: boolean;
  type: "primary" | "secondary";
  size: "xs" | "s" | "m" | "l" | "xl";
};

const BORDER_WIDTH = 4;
const debouncedOnPress = (onPress: onPress) => debounce(onPress, 50);

// TODO switch to our own Text component
export const Button = ({
  onPress,
  label,
  containerStyle,
  labelStyle,
  // labelColor, TODO
  disabled = false,
  type,
  size,
}: ButtonProps) => {
  const styles = useStyles();

  return (
    <Pressable
      onPress={debouncedOnPress(onPress ?? (() => undefined))}
      style={[styles.buttonBase, styles[type], styles[size], containerStyle]}
      disabled={disabled}
    >
      {!!label && (
        <Typography style={labelStyle} variant={size} color="darkBlue">
          {label}
        </Typography>
      )}
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

    // SIZES
    xs: {
      height: 40,
      paddingHorizontal: 16,
      borderWidth: 1,
    },
    s: {
      height: 48,
      paddingHorizontal: 18,
    },
    m: {
      height: 54,
      paddingHorizontal: 20,
    },
    l: {
      height: 58,
    },
    xl: {
      height: 58,
    },
  })
);
