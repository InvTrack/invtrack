import { useTheme } from "@react-navigation/native";
import { MainTheme } from ".";

type Generator<T extends object> = (theme: MainTheme) => T;

export const createStyles = <T extends object>(
  creatorFunction: Generator<T>
) => {
  const useStyles = (): T => {
    const theme = useTheme();
    return creatorFunction(theme as MainTheme);
  };
  return useStyles;
};
