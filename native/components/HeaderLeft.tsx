import { HeaderButtonProps } from "@react-navigation/elements";
import { Href, Link } from "expo-router";
import React from "react";
import { HomeIcon } from "./Icon";
interface HeaderLeft<T> extends HeaderButtonProps {
  href: Href<T>;
}
export const HeaderLeft = <T,>(props: HeaderLeft<T>) => {
  return (
    <Link href={props.href}>
      <HomeIcon size={32} />
    </Link>
  );
};
