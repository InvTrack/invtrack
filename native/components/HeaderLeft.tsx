import { HeaderButtonProps } from "@react-navigation/elements";
import { Link } from "expo-router";
import * as React from "react";
import { HomeIcon } from "./Icon";
interface HeaderLeft extends HeaderButtonProps {
  href: string;
}
export const HeaderLeft = (props: HeaderLeft) => {
  return (
    <Link href={props.href}>
      <HomeIcon size={32} />
    </Link>
  );
};
