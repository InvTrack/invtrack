import { useTheme } from "@react-navigation/native";
import React, { forwardRef } from "react";
import {
  Switch as NativeToggle,
  SwitchProps as NativeToggleProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { isAndroid } from "../constants";

export type ToggleProps = Omit<NativeToggleProps, "onValueChange" | "value"> & {
  value?: boolean;
  onChange: (newValue: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const Toggle = forwardRef<NativeToggle, ToggleProps>(
  (
    { value = true, onChange, disabled, style }: ToggleProps,
    ref: React.Ref<NativeToggle>
  ) => {
    const theme = useTheme();

    return (
      <NativeToggle
        ref={ref}
        trackColor={{
          true: theme.colors.green,
          false: theme.colors.red,
        }}
        // magic string, make the thumb color darker green on android
        thumbColor={isAndroid ? "rgb(20, 137, 56)" : undefined}
        ios_backgroundColor={value ? theme.colors.green : theme.colors.red}
        onValueChange={onChange}
        value={value}
        disabled={disabled}
        style={style}
      />
    );
  }
);
