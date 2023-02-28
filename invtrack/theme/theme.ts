import { DefaultTheme } from "@react-navigation/native";

const fontSize = {
  xl: 0,
  l: 0,
  m: 0,
  s: 0,
  xs: 0,
};

const colors = {
  ...DefaultTheme.colors,
  colors: {
    // all of these keys are required. change the values to hex?
    primary: "rgb(0, 122, 255)",
    background: "rgb(242, 242, 242)",
    card: "rgb(255, 255, 255)",
    text: "rgb(28, 28, 30)",
    border: "rgb(216, 216, 216)",
    notification: "rgb(255, 59, 48)",
  },
};

export const mainTheme = {
  ...DefaultTheme,
  dark: false,
  text: {
    xl: {
      fontSize: fontSize.xl,
      lineHeight: 0,
      fontFamily: "",
    },
    l: {
      fontSize: fontSize.l,
      lineHeight: 0,
      fontFamily: "",
    },
    m: {
      fontSize: fontSize.m,
      lineHeight: 0,
      fontFamily: "",
    },
    s: {
      fontSize: fontSize.s,
      lineHeight: 0,
      fontFamily: "",
    },
    xs: {
      fontSize: fontSize.xs,
      lineHeight: 0,
      fontFamily: "",
    },
  },
  spacing: 0,

  colors,
  fontSize,
} as const;

export type MainTheme = typeof mainTheme;
