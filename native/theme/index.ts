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

// TODO add a grey color for skeletons
export type ThemeColors = keyof typeof themeColors;
const themeColors = {
  black: "#000000",
  white: "#FFFFFF",
  lightBlue: "#EDF6FF",
  mediumBlue: "#C9E0F6",
  darkBlue: "#4A6D90",
  grey: "#96AFC8",
  error: "#EF5350",
} as const;

export type Breakpoints = typeof breakpoints;
const breakpoints = {
  base: 0,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
  "2xl": 1536,
} as const;

const baseShadow = {
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 4,
  elevation: 4,
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
  spacing: 8,
  opacity: 0.6,
  borderRadius: 25,
  borderRadiusSmall: 5,
  borderRadiusFull: 9999,
  breakpoints,
  colors: themeColors,
  fontSize,
  baseShadow,
} as const;
