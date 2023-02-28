import { useTheme } from "@react-navigation/native";
import { MainTheme } from "./theme";

type Generator<T extends {}> = (theme: MainTheme) => T;

export const createStyles = <T extends {}>(creatorFunction: Generator<T>) => {
  const useStyles = (): T => {
    const theme = useTheme();
    return creatorFunction(theme);
  };
  return useStyles;
};
