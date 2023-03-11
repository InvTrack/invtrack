import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput as NativeTextInput,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { createStyles } from "../../theme/useStyles";

interface TextInputProps extends NativeTextInputProps {
  rounded?: boolean;
  raised?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  editable?: boolean;
  focused?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  style?: never;
  InputRightElement?: JSX.Element;
  InputLeftElement?: JSX.Element;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
}

export const TextInput = React.forwardRef<NativeTextInput, TextInputProps>(
  (
    {
      InputRightElement,
      InputLeftElement,
      rounded = true,
      raised = false,
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
    const theme = useTheme();
    const style = useStyles();

    const [_focused, setFocused] = React.useState(false);
    // const [isHovered, setIsHovered] = React.useState(false);

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
          rounded ? style.rounded : {},
          raised ? style.raised : {},
          invalid ? style.invalid : {},
          (focused || _focused) && !raised && rounded ? style.focused : {},
          props.multiline ? style.containerMultiline : {},
          containerStyle,
        ]}
      >
        <View
          style={[
            style.content,
            rounded ? style.rounded : {},
            props.multiline ? style.contentMultiline : {},
          ]}
        >
          {InputLeftElement !== undefined && (
            <View style={style.leftElementContainer}>{InputLeftElement}</View>
          )}
          <NativeTextInput
            ref={ref}
            selectTextOnFocus={!disabled && editable}
            textAlignVertical="top"
            accessible
            accessibilityLabel={props.accessibilityLabel}
            editable={disabled || !editable ? false : true}
            placeholderTextColor={
              "white"
              // TODO
              // invalid
              //   ? theme.colors.danger
              //   : disabled
              //   ? theme.colors.dirtyWhite
              //   : theme.colors.lightGrey
            }
            onFocus={(e: any) =>
              handleFocus(onFocus ? () => onFocus(e) : undefined)
            }
            onBlur={(e: any) =>
              handleBlur(onBlur ? () => onBlur(e) : undefined)
            }
            style={[
              style.input,
              {
                paddingLeft: InputLeftElement ? 8 : 24,
                paddingRight: InputRightElement ? 8 : 24,
              },
              invalid ? style.invalidInput : {},
              disabled ? style.disabledInput : {},
              props.multiline ? style.inputMultiline : {},
              inputStyle,
            ]}
            {...props}
          />
          {InputRightElement !== undefined && (
            <View style={style.rightElementContainer}>{InputRightElement}</View>
          )}
        </View>
      </View>
    );
  }
);

TextInput.displayName = "TextInput";

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      height: 46,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      // TODO
      // borderColor: theme.colors.dirtyWhite,
      fontFamily: "Inter_400Regular",
      justifyContent: "center",
    },
    containerMultiline: {
      height: undefined,
      minHeight: 46,
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
    rounded: {
      borderRadius: 28,
    },
    raised: {
      borderColor: theme.colors.white,
      // TODO
      // shadowColor: theme.colors.shadowBase,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 4,
    },
    focused: {
      // TODO
      // shadowColor: theme.colors.shadowBase,
      shadowOpacity: 0.1,
      shadowOffset: { width: 10, height: 15 },
      shadowRadius: 25,
    },
    invalid: {
      // TODO
      // borderColor: theme.colors.danger,
    },
    disabled: {},
    input: {
      height: 44,
      flexGrow: 1,
      flexShrink: 1,
      width: "100%",
      paddingVertical: 10,
      paddingHorizontal: 24,
      // TODO
      // fontSize: theme.fontSizes.field,
      // TODO
      // color: theme.colors.veryDarkBlue,
      fontFamily: "Inter_400Regular",
    },
    inputMultiline: {
      height: undefined,
      paddingVertical: 6,
    },
    invalidInput: {
      // TODO
      // color: theme.colors.danger,
    },
    disabledInput: {
      // TODO
      // color: theme.colors.dirtyWhite,
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
