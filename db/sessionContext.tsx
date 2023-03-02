import { useState, createContext, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const SessionContext = createContext<Session | null>(null);

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session;
};

// export const SessionProvider = ({
//   children,
//   session,
// }: {
//   children: React.ReactNode;
//   session: Session;
// }) => {
//   if (!session) {
//     return <Text>Invalid session</Text>;
//   }

//   return (
//     <SessionContext.Provider value={{ session }}>
//       {children}
//     </SessionContext.Provider>
//   );
// };
