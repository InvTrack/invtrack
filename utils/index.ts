import { useTheme } from "@react-navigation/native";
import { useMediaQuery } from "react-responsive";
import { Breakpoints } from "../theme";

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
