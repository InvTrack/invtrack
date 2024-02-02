import { useSession } from "../db";
import { HomeStackNavigation } from "./HomeStackNavigation";
import { LoginStackNavigation } from "./LoginStackNavigation";

const RootNavigation = () => {
  const sessionState = useSession();
  const isLoggedIn = sessionState.loggedIn;

  if (isLoggedIn) {
    return <HomeStackNavigation />;
  }

  return <LoginStackNavigation />;
};

export default RootNavigation;
