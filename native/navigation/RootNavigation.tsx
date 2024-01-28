import React from "react";
import { useSession } from "../db";
import { HomeStackNavigation } from "./HomeStackNavigation";
import { LoginStackNavigation } from "./LoginStackNavigation";

// import HomeStackNavigation from './HomeStackNavigation';
// import LoginStackNavigation from './LoginStackNavigation';
// import UpdateNeededNavigation from './UpdateNeededNavigation';
// import UserNotAllowedNavigation from './UserNotAllowedNavigation';

const RootNavigation = () => {
  const sessionState = useSession();
  const isLoggedIn = sessionState.loggedIn;

  if (isLoggedIn) {
    return <HomeStackNavigation />;
  }

  return <LoginStackNavigation />;
};

export default RootNavigation;
