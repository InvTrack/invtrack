import { useState, createContext, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type SessionContextType =
  | { session: Session; loggedIn: true }
  | { session: null; loggedIn: false };

export const SessionContext = createContext<SessionContextType>({
  loggedIn: false,
  session: null,
});

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    setLoading(false);
  }, []);

  if (session && session.user)
    return { session, loggedIn: true, loading } as const;
  return { session: null, loggedIn: false, loading } as const;
};
