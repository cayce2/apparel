"use client";

import { useEffect } from "react";
import { useAuth, ensureAuthHydrated } from "@/lib/auth-store";
import { useWishlist } from "@/store/cart";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refresh = useAuth((s) => s.refresh);
  const syncWishlist = useWishlist((s) => s.sync);
  useEffect(() => {
    ensureAuthHydrated();
    void refresh();
    void syncWishlist();
  }, [refresh, syncWishlist]);
  return <>{children}</>;
}
