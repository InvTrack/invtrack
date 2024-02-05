import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
} from "react-native";

import { MainTheme, ThemeColors } from "../theme";
import { createStyles } from "../theme/useStyles";

export type TypographyProps = {
  children: React.ReactNode;
  color?: ThemeColors;
  style?: StyleProp<TextStyle>;
  textProps?: Omit<TextProps, keyof TypographyProps>;
  variant?: keyof MainTheme["text"];
  numberOfLines?: number;
  align?: "left" | "center" | "right" | "auto" | "justify";
  opacity?: boolean;
};

export const Typography = ({
  children,
  color,
  style,
  textProps,
  variant = "l",
  numberOfLines,
  align = "left",
  opacity = false,
}: TypographyProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Text
      style={[
        color && { color: theme.colors[color] },
        styles[variant],
        align && styles[`align${align}`],
        opacity && styles.opacity,
        style,
      ]}
      numberOfLines={numberOfLines}
      {...textProps}
    >
      {children}
    </Text>
  );
};

const useStyles = createStyles((theme) =>
  StyleSheet.create({
    alignleft: {
      textAlign: "left",
    },
    aligncenter: {
      textAlign: "center",
    },
    alignright: {
      textAlign: "right",
    },
    alignauto: {
      textAlign: "auto",
    },
    alignjustify: {
      textAlign: "justify",
    },
    xs: { ...theme.text.xs },
    xsBold: { ...theme.text.xsBold },
    s: { ...theme.text.s },
    sBold: { ...theme.text.sBold },
    m: { ...theme.text.m },
    mBold: { ...theme.text.mBold },
    l: { ...theme.text.l },
    lBold: { ...theme.text.lBold },
    xl: { ...theme.text.xl },
    xlBold: { ...theme.text.xlBold },
    opacity: {
      opacity: theme.opacity,
    },
  })
);
