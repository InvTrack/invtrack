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
