import { HeaderButtonProps } from "@react-navigation/elements";
import { Link } from "expo-router";
import * as React from "react";
import { HomeIcon } from "../Icon";

export const HeaderLeft = (_props: HeaderButtonProps) => {
  return (
    <Link href="/(start)/start">
      <HomeIcon size={32} />
    </Link>
  );
};
