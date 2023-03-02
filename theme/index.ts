export type ThemeFontSize = typeof fontSize;
const fontSize = {
  xl: 40,
  xlBold: 40,
  l: 24,
  lBold: 24,
  m: 22,
  mBold: 22,
  s: 20,
  sBold: 20,
  xs: 17,
  xsBold: 17,
} as const;

export type ThemeColors = keyof typeof themeColors;
const themeColors = {
  black: "#000000",
  white: "#FFFFFF",
  lightBlue: "#EDF6FF",
  mediumBlue: "#C9E0F6",
  darkBlue: "#4A6D90",
} as const;

export type MainTheme = typeof mainTheme;
export const mainTheme = {
  dark: false,
  text: {
    xl: {
      fontSize: fontSize.xl,
      lineHeight: 37,
      fontFamily: "latoRegular",
    },
    xlBold: {
      fontSize: fontSize.xl,
      lineHeight: 37,
      fontFamily: "latoBold",
    },
    l: {
      fontSize: fontSize.l,
      lineHeight: 27,
      fontFamily: "latoRegular",
    },
    lBold: {
      fontSize: fontSize.l,
      lineHeight: 27,
      fontFamily: "latoBold",
    },
    m: {
      fontSize: fontSize.m,
      lineHeight: 24,
      fontFamily: "latoRegular",
    },
    mBold: {
      fontSize: fontSize.m,
      lineHeight: 24,
      fontFamily: "latoBold",
    },
    s: {
      fontSize: fontSize.s,
      lineHeight: 20,
      fontFamily: "latoRegular",
    },
    sBold: {
      fontSize: fontSize.s,
      lineHeight: 20,
      fontFamily: "latoBold",
    },
    xs: {
      fontSize: fontSize.xs,
      lineHeight: 17,
      fontFamily: "latoRegular",
    },
    xsBold: {
      fontSize: fontSize.xs,
      lineHeight: 17,
      fontFamily: "latoBold",
    },
  },
  spacing: 0,

  colors: themeColors,
  fontSize,
} as const;

// Module override
import "@react-navigation/native";
import { ReactNode } from "react";

declare module "@react-navigation/native" {
  export function useTheme(): MainTheme;
  function ThemeProvider({
    value,
    children,
  }: {
    value: MainTheme;
    children: ReactNode;
  }): JSX.Element;
}
