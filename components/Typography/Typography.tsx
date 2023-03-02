import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  StyleProp,
  Text,
  TextProps,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { MainTheme, ThemeColors } from "../../theme";
import { createStyles } from "../../theme/useStyles";

type TypographyProps = {
  children: React.ReactNode;
  color?: ThemeColors;
  textStyle?: StyleProp<ViewStyle>;
  textProps?: Omit<TextProps, keyof TypographyProps>;
  variant?: keyof MainTheme["text"];
  numberOfLines?: number;
  align?: "left" | "center" | "right" | "auto" | "justify";
};
// Consider adding variants to a StyleSheets, then using them as style[variant]

const Typography = ({
  children,
  color,
  textStyle,
  textProps,
  variant = "l",
  numberOfLines,
  align = "left",
}: TypographyProps) => {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Text
      style={[
        color && { color: theme.colors[color] },
        styles[variant],
        {
          textAlign: align,
        },
        textStyle,
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
  })
);

export default Typography;
