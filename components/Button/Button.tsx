import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import debounce from "lodash/debounce";
import { createStyles } from "../../theme/useStyles";
import { mainTheme, ThemeColors } from "../../theme";
import { Typography, TypographyProps } from "../Typography";

type onPress = (event: GestureResponderEvent) => void;
type ButtonProps = {
  onPress: onPress;
  buttonContent: string | JSX.Element;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: TypographyProps["style"];
  color: ThemeColors;
  disabled?: boolean;
};

const useStyles = createStyles((theme) =>
  // placeholder to turn off eslint error
  StyleSheet.create({ buttonStyle: { borderBottomWidth: theme.spacing } })
);

const debouncedOnPress = (onPress: onPress) => debounce(onPress, 50);

// TODO switch to our own Text component
export const Button = ({
  onPress,
  buttonContent,
  containerStyle,
  labelStyle,
  // labelColor, TODO
  color = "lightBlue",
  disabled = false,
}: ButtonProps) => {
  const styles = useStyles();

  return (
    <TouchableOpacity
      onPress={debouncedOnPress(onPress)}
      style={[
        styles.buttonStyle,
        { backgroundColor: mainTheme.colors[color] },
        containerStyle,
      ]}
      disabled={disabled}
    >
      {!!buttonContent && (
        <Typography style={labelStyle}>{buttonContent}</Typography>
      )}
    </TouchableOpacity>
  );
};
