"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isAdmin: false,
    loading: true,
  });

  const checkAdmin = useCallback(async (user: User | null) => {
    if (!user) return false;
    const { data } = await supabase.rpc("is_admin");
    return data === true;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const admin = await checkAdmin(session?.user ?? null);
      setState({
        session,
        user: session?.user ?? null,
        isAdmin: admin,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const admin = await checkAdmin(session?.user ?? null);
      setState({
        session,
        user: session?.user ?? null,
        isAdmin: admin,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
