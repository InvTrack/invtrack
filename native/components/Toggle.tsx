import { useTheme } from "@react-navigation/native";
import React, { forwardRef } from "react";
import {
  Switch as NativeToggle,
  SwitchProps as NativeToggleProps,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Typography } from "./Typography";

export type ToggleProps = Omit<NativeToggleProps, "onValueChange" | "value"> & {
  value?: boolean;
  onChange: (newValue: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  shortened?: boolean;
};

export const Toggle = forwardRef<NativeToggle, ToggleProps>(
  (
    { value = true, onChange, disabled, style, label, labelStyle }: ToggleProps,
    ref: React.Ref<NativeToggle>
  ) => {
    const theme = useTheme();

    return (
      <View style={{ justifyContent: "flex-start" }}>
        <NativeToggle
          ref={ref}
          trackColor={{
            true: theme.colors.green,
            false: theme.colors.red,
          }}
          ios_backgroundColor={value ? theme.colors.green : theme.colors.red}
          onValueChange={onChange}
          value={value}
          disabled={disabled}
          style={style}
        />
        <Typography style={labelStyle}>{label}</Typography>
      </View>
    );
  }
);
