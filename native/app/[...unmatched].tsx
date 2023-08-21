import { Redirect, Unmatched, useRootNavigationState } from "expo-router";

export default function Undef() {
  const navigationState = useRootNavigationState();

  if (!navigationState?.key) {
    // Temporary fix for router not being ready.
    return;
  }
  return (
    <>
      <Redirect href={"/(tabs)/list"} />
      <Unmatched />
    </>
  );
}
