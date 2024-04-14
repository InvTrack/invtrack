import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EnvConfig } from "../config/env";

import { Typography } from "./Typography";

export const DevInfo = () => {
  const { bottom: safeAreaBottomInset } = useSafeAreaInsets();
  return (
    <Typography
      color="darkGrey"
      style={{
        position: "absolute",
        alignSelf: "flex-end",
        fontSize: 10,
        bottom: safeAreaBottomInset,
      }}
    >
      {EnvConfig.devInfoString}
    </Typography>
  );
};
