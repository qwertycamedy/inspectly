import { useEffect } from "react";

import { supabase } from "@/lib";
import { useAuthStore } from "@/features/auth/auth-store";

export function AuthBootstrap() {
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      useAuthStore.getState().setSession(session);
      useAuthStore.getState().setInitialized(true);
    }

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
      useAuthStore.getState().setInitialized(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
