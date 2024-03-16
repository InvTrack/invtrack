import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { isIos } from "../constants";
import { createStyles } from "../theme/useStyles";
import { getKeyboardVerticalOffset } from "../utils";

interface SafeLayoutProps {
  scrollable?: boolean;
  insetTop?: boolean;
  insetBottom?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  isKeyboardAvoiding?: true;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const SafeLayout = ({
  scrollable,
  insetTop,
  insetBottom,
  style,
  containerStyle,
  children,
  ...props
}: SafeLayoutProps) => {
  const styles = useStyles();

  const handleUnhandledTouches = () => {
    Keyboard.dismiss();
    return false;
  };

  return (
    <SafeAreaView
      edges={[
        "left",
        "right",
        insetTop ? "top" : "left",
        insetBottom ? "top" : "right",
      ]}
      style={[styles.container, containerStyle]}
      onStartShouldSetResponder={handleUnhandledTouches}
      {...props}
    >
      {scrollable ? (
        <KeyboardAvoidingView
          behavior={isIos ? "padding" : undefined}
          keyboardVerticalOffset={getKeyboardVerticalOffset()}
        >
          <ScrollView
            scrollEventThrottle={100}
            contentContainerStyle={{
              backfaceVisibility: "hidden",
              backgroundColor: "transparent",
            }}
          >
            <View style={[styles.container, style]}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView
          behavior={isIos ? "padding" : "height"}
          style={styles.layoutContainer}
        >
          <View style={[styles.container, style]}>{children}</View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default SafeLayout;

const useStyles = createStyles(() =>
  StyleSheet.create({
    container: {
      // flex: 1,
      flexGrow: 1,
      backgroundColor: "rgba(0 0 0 0)",
    },
    layoutContainer: {
      flex: 1,
    },
  })
);
