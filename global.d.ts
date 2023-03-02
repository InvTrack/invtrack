import "@react-navigation/native";
import { ReactNode } from "react";
import { MainTheme } from "./theme";

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
