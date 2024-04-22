import { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../supabase";

type SessionContextLoggedInType = {
  session: Session;
  loggedIn: true;
};
type SessionContextNotLoggedInType = {
  session: null;
  loggedIn: false;
};
type SessionContextType =
  | SessionContextLoggedInType
  | SessionContextNotLoggedInType;

export const SessionContext = createContext<SessionContextType>({
  loggedIn: false,
  session: null,
});

export const useSessionState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, _session) => {
        // console.log("auth changed", session?.user.id);
        setSession(_session);
      }
    );
    setLoading(false);

    return () => data.subscription.unsubscribe();
  }, []);

  if (session && session.user) {
    return {
      session,
      loggedIn: true,
      loading,
    } as SessionContextLoggedInType & { loading: boolean };
  }

  return {
    session: null,
    loggedIn: false,
    loading,
  } as SessionContextNotLoggedInType & { loading: boolean };
};

export const useSession = () => {
  const data = useContext(SessionContext);
  return data;
};
