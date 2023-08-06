import { HeaderButtonProps } from "@react-navigation/elements";
import { Href, Link } from "expo-router";
import * as React from "react";
import { CogIcon } from "./Icon";

interface HeaderRight<T> extends HeaderButtonProps {
  href: Href<T>;
}
export const HeaderRight = <T,>(props: HeaderRight<T>) => {
  return (
    <Link href={props.href}>
      <CogIcon size={32} />
    </Link>
  );
};
