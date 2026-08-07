import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function fail(label: string) {
  throw new Error(
    `Missing Supabase env var ${label}. Copy .env.example to .env.local and fill in your project keys (Settings > API in Supabase).`
  );
}

/**
 * Browser client — anon key, RLS-enforced, used by client components and the
 * authenticated session. Safe to expose to the browser.
 */
export function supabaseBrowser() {
  if (!url || !anonKey) fail("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
}

/**
 * Server client — bypasses RLS using the service role key. ONLY use inside
 * Next.js server components / route handlers. Never import in client code.
 *
 * Pass an optional `authUid` to apply a SET LOCAL role filter for queries
 * that need to act on behalf of a specific user.
 */
export function supabaseServer(authUid?: string) {
  if (!url || !serviceKey) fail("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(url, serviceKey, { auth: { persistSession: false } });
  if (authUid) {
    // hint for any SECURITY DEFINER functions that respect request.jwt.claim.sub
    void client.rpc("set_config", { name: "request.uid", value: authUid });
  }
  return client;
}

/** Anonymous server client (RLS-enforced) — used for public reads from server code. */
export function supabasePublic() {
  if (!url || !anonKey) fail("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
