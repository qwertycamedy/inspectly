import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  isInitialized: boolean;

  setSession: (session: Session | null) => void;
  setInitialized: (isInitialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  isInitialized: false,

  setSession: (session) => {
    set({ session });
  },

  setInitialized: (isInitialized) => {
    set({ isInitialized });
  },
}));