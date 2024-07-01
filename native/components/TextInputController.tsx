import React, { useEffect, useRef } from "react";
import {
  FieldPath,
  FieldValues,
  UseControllerProps,
  UseControllerReturn,
  useController,
} from "react-hook-form";

import { View, ViewStyle } from "react-native";
import { TextInput, TextInputProps } from "./TextInput";
import { Typography } from "./Typography";

type Timer = ReturnType<typeof setTimeout>;
const debounce = <T extends FieldValues, K extends FieldPath<T>>(
  onChange: UseControllerReturn<T, K>["field"]["onChange"],
  delay = 2000
): UseControllerReturn<T, K>["field"]["onChange"] => {
  const timer = useRef<Timer>();
  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = (() => {
    const newTimer = setTimeout(() => {
      onChange();
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as UseControllerReturn<T, K>["field"]["onChange"];

  return debouncedFunction;
};

type TextInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  shouldDebounce?: boolean;
} & {
  textInputProps?: Omit<TextInputProps, "onChange"> & {
    containerStyle?: ViewStyle;
  };
};
/**
 * be vary when setting the `value` prop explicitly here
 */
export const TextInputController = <T extends FieldValues>({
  textInputProps,
  shouldDebounce,
  ...props
}: TextInputControllerProps<T>) => {
  const {
    field: { onChange, onBlur, ref, value },
    fieldState: { error },
  } = useController(props);

  const { containerStyle, ...restTextInputProps } = textInputProps || {};

  return (
    <View style={containerStyle}>
      <TextInput
        {...restTextInputProps}
        onChange={shouldDebounce ? debounce(onChange) : onChange}
        value={restTextInputProps?.value || value}
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

export default TextInputController;
