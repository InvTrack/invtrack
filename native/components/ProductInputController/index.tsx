import React from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { TextInput, TextInputProps } from "../TextInput";
import { Typography } from "../Typography";

type TextInputControllerProps<T extends FieldValues> = UseControllerProps<T> & {
  textInputProps?: Omit<TextInputProps, "value" | "onChange">;
  unit: string | null;
};

export const ProductInputController = <T extends FieldValues>({
  textInputProps,
  unit,
  ...props
}: TextInputControllerProps<T>) => {
  const {
    field: { onChange, onBlur, ref, value },
    // fieldState: { error },
  } = useController(props);
  const theme = useTheme();
  // TODO Error handling
  console.log("value", value);
  const valueLength = (value?.toString() || "").length;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginRight: valueLength > 3 ? (valueLength > 5 ? 0 : 16) : 0,
      }}
    >
      <TextInput
        onChange={onChange}
        value={value}
        onBlur={onBlur}
        ref={ref}
        // error={!!error}
        keyboardType="numeric"
        inputMode="numeric"
        containerStyle={{
          borderWidth: 0,
          height: 72,
          paddingHorizontal: 0,
          flexGrow: 1,
        }}
        inputStyle={{
          textAlign: "right",
          fontSize: (value || 0) > 999 ? theme.fontSize.l : theme.fontSize.xl,
          fontWeight: "600",
          paddingHorizontal: 0,
          flex: 1,
        }}
        {...textInputProps}
      />
      <Typography
        variant={(value || 0) > 999 ? "lBold" : "xlBold"}
        style={{
          paddingTop: (value || 0) > 999 ? 0 : 8,
        }}
      >
        {" " + unit}
      </Typography>
      {/* {error && <Typography variant="error">{error.message}</Typography>} */}
    </View>
  );
};
