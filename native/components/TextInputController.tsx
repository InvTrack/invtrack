import React from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { TextInput, TextInputProps } from "./TextInput";
import { Typography } from "./Typography";

// import { Typography } from "../Typography";

type TextInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  textInputProps?: Omit<TextInputProps, "onChange">;
};
/**
 * be vary when setting the `value` prop explicitly here
 */
export const TextInputController = <T extends FieldValues>({
  textInputProps,
  ...props
}: TextInputControllerProps<T>) => {
  const {
    field: { onChange, onBlur, ref, value },
    fieldState: { error },
  } = useController(props);

  // TODO Error handling
  return (
    <>
      <TextInput
        {...textInputProps}
        onChange={onChange}
        value={textInputProps?.value || value}
        onBlur={onBlur}
        ref={ref}
      />
      {error && (
        <Typography
          variant="xs"
          color="error"
          style={{ marginLeft: 8, marginTop: 4 }}
        >
          {error.message}
        </Typography>
      )}
    </>
  );
};

export default TextInputController;
