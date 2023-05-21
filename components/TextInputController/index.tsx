import React from "react";
import {
  FieldValues,
  UseControllerProps,
  useController,
} from "react-hook-form";

import { TextInput, TextInputProps } from "../TextInput";

// import { Typography } from "../Typography";

interface TextInputControllerProps<T extends FieldValues>
  extends UseControllerProps<T> {
  textInputProps?: Omit<TextInputProps, "value" | "onChange">;
}

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
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        value={value}
        // error={!!error}
        {...textInputProps}
      />

      {/* {error && <Typography variant="error">{error.message}</Typography>} */}
    </>
  );
};

export default TextInputController;
