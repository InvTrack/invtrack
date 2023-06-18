import { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

import { supabase } from "../supabase";

type SessionContextLoggedInType = {
  session: Session;
  loggedIn: true;
  companyId: number;
};
type SessionContextNotLoggedInType = {
  session: null;
  loggedIn: false;
  companyId: null;
};
// TODO try to move to @tanstack/react-query
/**
 * Session Context for user authentication, login etc.
 */
type SessionContextType =
  | SessionContextLoggedInType
  | SessionContextNotLoggedInType;

export const SessionContext = createContext<SessionContextType>({
  loggedIn: false,
  session: null,
  companyId: null,
});

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<null | number>(null);
  useEffect(() => {
    // TODO: remove duplicated code
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        return supabase
          .from("worker")
          .select("id, company_id")
          .eq("id", session.user.id)
          .single()
          .then((res) => {
            if (res && res.data) {
              setCompanyId(res.data["company_id"]);
            }
          });
      }
      return null;
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        return supabase
          .from("worker")
          .select("id, company_id")
          .eq("id", session.user.id)
          .single()
          .then((res) => {
            if (res && res.data) {
              setCompanyId(res.data["company_id"]);
            }
          });
      }
    });
    setLoading(false);
  }, []);

  if (session && session.user) {
    return {
      session,
      loggedIn: true,
      loading,
      companyId,
    } as SessionContextLoggedInType & { loading: boolean };
  }

  return {
    session: null,
    loggedIn: false,
    loading,
    companyId,
  } as SessionContextNotLoggedInType & { loading: boolean };
};
