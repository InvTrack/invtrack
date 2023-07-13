import { HeaderButtonProps } from "@react-navigation/elements";
import { Link } from "expo-router";
import * as React from "react";
import { CogIcon } from "./Icon";

interface HeaderRight extends HeaderButtonProps {
  href: string;
}
export const HeaderRight = (props: HeaderRight) => {
  return (
    <Link href={props.href}>
      <CogIcon size={32} />
    </Link>
  );
};
