import debounce from "lodash/debounce";
import React, { forwardRef } from "react";
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { createStyles } from "../theme/useStyles";
import { ExpandMoreIcon } from "./Icon";
import { LoadingSpinner } from "./LoadingSpinner";
import { Typography, TypographyProps } from "./Typography";

export type ButtonOnPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress?: ButtonOnPress;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  disabled?: boolean;
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
  return debounce(onPress ?? (() => undefined), 50)(e);
};

export const DropdownButton = forwardRef(
  (
    {
      onPress,
      containerStyle,
      // labelColor, TODO
      disabled = false,
      children,
      isLoading = false,
    }: ButtonProps,
    _ref
  ) => {
    const styles = useStyles();
    const isStringChildren = typeof children === "string";
    return (
      <TouchableOpacity
        onPress={isLoading ? () => {} : (e) => debounceOnPress(e, onPress)}
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 4,
            borderRadius: 10,
          },
          styles.primary,
          styles.l,
          styles.fullWidth,
          disabled && styles.disabled,
          containerStyle,
        ]}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.buttonBase,
            {
              alignItems: "flex-start",
            },
          ]}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : isStringChildren ? (
            <Typography variant="m" style={styles.string}>
              {children}
            </Typography>
          ) : (
            children
          )}
        </View>
        <ExpandMoreIcon />
      </TouchableOpacity>
    );
  }
);

DropdownButton.displayName = "Button";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    buttonBase: {
      flexShrink: 1,
      margin: theme.spacing * 0.5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadiusSmall,
    },
    primary: {
      backgroundColor: theme.colors.darkBlue,
      borderColor: theme.colors.highlight,
      borderWidth: BORDER_WIDTH,
      // padding: theme.spacing - BORDER_WIDTH,
    },
    fullWidth: {
      width: "100%",
    },
    string: {
      color: theme.colors.lightGrey,
    },
    disabled: { opacity: 0.6 },
    l: {
      height: 58,
      width: 58,
    },
  })
);
