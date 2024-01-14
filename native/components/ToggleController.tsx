import React from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { Toggle, ToggleProps } from "./Toggle";

type ToggleControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  toggleProps?: Omit<ToggleProps, "onChange">;
};
/**
 * be vary when setting the `value` prop explicitly here
 */
export const ToggleController = <T extends FieldValues>({
  toggleProps,
  ...props
}: ToggleControllerProps<T>) => {
  const {
    field: { onChange, ref, value },
  } = useController(props);

  // TODO Error handling
  return (
    <Toggle
      {...toggleProps}
      ref={ref}
      onChange={onChange}
      value={toggleProps?.value || value}
    />
  );
};

export default ToggleController;
