import React from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { View, ViewStyle } from "react-native";
import { TextInput, TextInputProps } from "./TextInput";
import { Typography } from "./Typography";

type NumberInputControllerProps<T extends FieldValues> =
  UseControllerProps<T> & {
    textInputProps?: Omit<TextInputProps, "onChange"> & {
      containerStyle?: ViewStyle;
    };
  };
/**
 * be vary when setting the `value` prop explicitly here
 */
export const NumberInputController = <T extends FieldValues>({
  textInputProps,
  ...props
}: NumberInputControllerProps<T>) => {
  const {
    field: { onChange, onBlur, ref, value },
    fieldState: { error },
  } = useController(props);

  const { containerStyle, ...restTextInputProps } = textInputProps || {};

  return (
    <View style={containerStyle}>
      <TextInput
        {...restTextInputProps}
        onChange={(text) => onChange(+text)}
        value={value}
        onBlur={onBlur}
        ref={ref}
      />
      {error && (
        <Typography
          variant="xs"
          color="red"
          style={{ marginLeft: 8, marginTop: 4 }}
        >
          {error.message}
        </Typography>
      )}
    </View>
  );
};

export default NumberInputController;
