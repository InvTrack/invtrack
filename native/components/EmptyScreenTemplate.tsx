import { ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createStyles } from "../theme/useStyles";
import { Typography } from "./Typography";

export const EmptyScreenTemplate = ({
  children,
  style,
  centerText,
}: {
  children: string | ReactNode;
  style?: StyleProp<ViewStyle>;
  centerText?: boolean;
}) => {
  const styles = useStyles();
  const topInset = useSafeAreaInsets().top;
  if (typeof children === "string") {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { paddingTop: topInset > 16 ? 16 : topInset },
          style,
        ]}
      >
        <Typography
          variant="l"
          color="lightGrey"
          align={centerText ? "center" : undefined}
        >
          {children}
        </Typography>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: topInset > 16 ? topInset : 16 },
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.darkBlue,
      height: "100%",
      paddingHorizontal: theme.spacing * 5,
    },
  })
);
