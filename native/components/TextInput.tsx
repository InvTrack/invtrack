import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  TextInput as NativeTextInput,
  TextInputFocusEventData,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { createStyles } from "../theme/useStyles";

const BORDER_WIDTH = 4;
export type TextInputProps = Omit<NativeTextInputProps, "onChange"> & {
  invalid?: boolean;
  disabled?: boolean;
  editable?: boolean;
  focused?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  style?: never;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onChange: (text: string) => void;
};

export const TextInput = React.forwardRef<NativeTextInput, TextInputProps>(
  (
    {
      value = "",
      onChange,
      invalid = false,
      disabled = false,
      editable = true,
      focused = false,
      inputStyle,
      containerStyle,
      onFocus,
      onBlur,
      ...props
    },
    ref: React.Ref<NativeTextInput>
  ) => {
    const style = useStyles();
    const theme = useTheme();
    const [_focused, setFocused] = React.useState(false);

    const handleFocus = (callback?: any) => {
      setFocused(true);
      callback && callback();
    };

    const handleBlur = (callback?: any) => {
      setFocused(false);
      callback && callback();
    };

    return (
      <View
        style={[
          style.container,
          focused || _focused ? style.focused : {},
          props.multiline ? style.containerMultiline : {},
          containerStyle,
        ]}
      >
        <View
          style={[style.content, props.multiline ? style.contentMultiline : {}]}
        >
          <NativeTextInput
            ref={ref}
            onChangeText={onChange}
            value={value}
            selectTextOnFocus={!disabled && editable}
            textAlignVertical="top"
            accessible
            accessibilityLabel={props.accessibilityLabel}
            editable={!disabled || editable}
            placeholderTextColor={
              theme.colors.darkBlue
              // TODO
              // invalid
              //   ? theme.colors.danger
              //   : disabled
              //   ? theme.colors.dirtyWhite
              //   : theme.colors.lightGrey
            }
            onFocus={(e: NativeSyntheticEvent<TextInputFocusEventData>) =>
              handleFocus(onFocus ? () => onFocus(e) : () => undefined)
            }
            onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) =>
              handleBlur(onBlur ? () => onBlur(e) : () => undefined)
            }
            style={[
              style.input,
              props.multiline ? style.inputMultiline : {},
              inputStyle,
            ]}
            {...props}
          />
        </View>
      </View>
    );
  }
);

TextInput.displayName = "TextInput";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      ...theme.text.s,
      borderRadius: theme.borderRadiusFull,
      height: 44,
      justifyContent: "center",
      borderColor: theme.colors.mediumBlue,
      borderWidth: BORDER_WIDTH,
      padding: theme.spacing - BORDER_WIDTH,
    },
    containerMultiline: {
      height: undefined,
      minHeight: 44,
    },
    content: {
      height: 44,
      overflow: "hidden",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    contentMultiline: {
      height: undefined,
      minHeight: 44,
      paddingVertical: 6,
    },
    focused: {
      ...theme.baseShadow,
    },
    input: {
      height: 44,
      flexGrow: 1,
      flexShrink: 1,
      width: "100%",
      paddingHorizontal: theme.spacing * 2,
      // TODO
      // fontSize: theme.fontSizes.field,
      // TODO
      // color: theme.colors.veryDarkBlue,
    },
    inputMultiline: {
      height: undefined,
      paddingVertical: 6,
    },
    leftElementContainer: {
      flexShrink: 0,
      paddingLeft: 4,
    },
    rightElementContainer: {
      flexShrink: 0,
      paddingRight: 8,
    },
  })
);
