import React from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { TextInput, TextInputProps } from "./TextInput";

// import { Typography } from "../Typography";

type TextInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  textInputProps?: Omit<TextInputProps, "onChange">;
};
/**
 * be vary when setting the value explicitly here
 */
export const TextInputController = <T extends FieldValues>({
  textInputProps,
  ...props
}: TextInputControllerProps<T>) => {
  const {
    field: { onChange, onBlur, ref, value },
    // fieldState: { error },
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
        // error={!!error}
      />

      {/* {error && <Typography variant="error">{error.message}</Typography>} */}
    </>
  );
};

export default TextInputController;
