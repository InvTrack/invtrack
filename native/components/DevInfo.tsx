import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EnvConfig } from "../env.config";
import { Typography } from "./Typography";

export const DevInfo = () => {
  const { bottom: safeAreaBottomInset } = useSafeAreaInsets();
  return (
    <Typography
      color="darkGrey"
      style={{
        position: "absolute",
        alignSelf: "flex-end",
        fontSize: 12,
        bottom: safeAreaBottomInset,
      }}
    >
      {EnvConfig.devInfoString}
    </Typography>
  );
};
