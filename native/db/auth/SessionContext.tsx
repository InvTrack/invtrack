import { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";

import { supabase } from "../supabase";
import { useGetTokens } from "./LinkingContext";

type SessionContextLoggedInType = {
  session: Session;
  loggedIn: true;
  companyId: number;
  googleAccessToken: null;
};
type SessionContextNotLoggedInType = {
  session: null;
  loggedIn: false;
  companyId: null;
  googleAccessToken: null | string;
};
// TODO try to move to react-query
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
  googleAccessToken: null,
});

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<null | number>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<null | string>(
    null
  );
  useGetTokens(setGoogleAccessToken);
  useEffect(() => {
    // TODO: remove duplicated code
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log("get session", session);
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      // console.log("auth changed", session);
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
      googleAccessToken,
    } as SessionContextLoggedInType & { loading: boolean };
  }

  return {
    session: null,
    loggedIn: false,
    loading,
    companyId,
    googleAccessToken,
  } as SessionContextNotLoggedInType & { loading: boolean };
};
