export type ThemeFontSize = typeof fontSize;
const fontSize = {
  xl: 40,
  l: 24,
  m: 22,
  s: 20,
  xs: 17,
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
      fontFamily: "",
    },
    l: {
      fontSize: fontSize.l,
      lineHeight: 27,
      fontFamily: "",
    },
    m: {
      fontSize: fontSize.m,
      lineHeight: 24,
      fontFamily: "",
    },
    s: {
      fontSize: fontSize.s,
      lineHeight: 20,
      fontFamily: "",
    },
    xs: {
      fontSize: fontSize.xs,
      lineHeight: 17,
      fontFamily: "",
    },
  },
  spacing: 0,

  colors: themeColors,
  fontSize,
} as const;
