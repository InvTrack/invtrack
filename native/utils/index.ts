import { useTheme } from "@react-navigation/native";
import { useMediaQuery } from "react-responsive";

import { Dimensions } from "react-native";
import { isIos } from "../constants";
import { Breakpoints } from "../theme";

export const deviceDimensions = Dimensions.get("window");
export const isWideScreen = (width: number) => width >= 600;
const getShorterScreenSide = (width: number, height: number) =>
  Math.min(width, height);

export const isBigScreen = (width: number, height: number) =>
  isWideScreen(getShorterScreenSide(width, height));

export const getKeyboardVerticalOffset = () => {
  const isScreenBig = isBigScreen(
    deviceDimensions.width,
    deviceDimensions.height
  );

  if (isIos) {
    return isScreenBig ? 120 : 180;
  }
  return isScreenBig ? 160 : 220;
};

export const formatFloatString = (value: string): number =>
  parseFloat(value.replace(/,/g, "."));

export const roundFloat = (value: number): number =>
  Math.round(value * 100) / 100;

export const formatAndRoundFloat = (value: string): number =>
  roundFloat(formatFloatString(value));

export const getBestCameraRatio = (ratios: string[]): string => {
  if (ratios.includes("16:9")) return "16:9";

  const mRatios = ratios.map((ratio) => {
    const [width, height] = ratio.split(":").map((n) => parseInt(n));
    return width / height;
  });
  const maxRatio = Math.max(...mRatios);
  const index = mRatios.indexOf(maxRatio);
  return ratios[index];
};

export function useThemeBreakpoints() {
  const { breakpoints } = useTheme();
  return {
    sm: useMediaQuery({
      minWidth: breakpoints.sm,
    }),
    md: useMediaQuery({
      minWidth: breakpoints.md,
    }),
    lg: useMediaQuery({
      minWidth: breakpoints.lg,
    }),
    xl: useMediaQuery({
      minWidth: breakpoints.xl,
    }),
    xxl: useMediaQuery({
      minWidth: breakpoints["2xl"],
    }),
  };
}

export function useThemeCurrentBreakpoint(): keyof Breakpoints {
  const { sm, md, lg, xl, xxl } = useThemeBreakpoints();
  return xxl ? "2xl" : xl ? "xl" : lg ? "lg" : md ? "md" : sm ? "sm" : "base";
}

/**
 *
 * Tests whether the current screen width is greater than or equal to the given breakpoint.
 */
export const useThemeBreakpoint = (breakpoint: keyof Breakpoints): boolean => {
  const { breakpoints } = useTheme();
  const result = useMediaQuery({
    minWidth: breakpoints[breakpoint],
  });
  return result;
};
