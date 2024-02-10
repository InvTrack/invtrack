import { ReactNode } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  if (typeof children === "string") {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <Typography
          variant="l"
          color="darkGrey"
          align={centerText ? "center" : undefined}
        >
          {children}
        </Typography>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
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
