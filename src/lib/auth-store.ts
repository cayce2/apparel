"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/api/client";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  role?: "admin" | "staff";
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  refresh: async () => {
    try {
      const { user, profile } = await api<{ user: any | null; profile?: any }>("/api/auth/me");
      if (!user) { set({ user: null, loading: false }); return null; }
      const u: AuthUser = {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        role: profile?.role,
      };
      set({ user: u, loading: false });
      return u;
    } catch {
      set({ user: null, loading: false });
      return null;
    }
  },
  signIn: async (email, password) => {
    const { user } = await api<{ user: any }>("/api/auth/sign-in", { method: "POST", body: JSON.stringify({ email, password }) });
    await get().refresh();
    return get().user as AuthUser;
  },
  signUp: async (email, password, fullName) => {
    await api("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
    await get().signIn(email, password);
    return get().user as AuthUser;
  },
  signOut: async () => {
    await api("/api/auth/sign-out", { method: "POST" });
    set({ user: null });
  },
}));

// hydrate on first load (client only)
let hydrated = false;
export function ensureAuthHydrated() {
  if (hydrated) return;
  hydrated = true;
  if (typeof window !== "undefined") useAuth.getState().refresh();
}
