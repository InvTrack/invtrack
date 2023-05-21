import { MainTheme } from ".";
import { useTheme } from "@react-navigation/native";

type Generator<T extends object> = (theme: MainTheme) => T;

export const createStyles = <T extends object>(
  creatorFunction: Generator<T>
) => {
  const useStyles = (): T => {
    const theme = useTheme();
    return creatorFunction(theme);
  };
  return useStyles;
};
