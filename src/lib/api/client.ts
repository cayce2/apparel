"use client";

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.error ?? msg; } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

/** Pull a readable message out of an Error or thrown fetch response. */
export function parseApiError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}

/** Mutate / write helper that runs a fetch and returns the parsed response. */
export async function mutate<T = any>(path: string, init?: RequestInit) {
  return api<T>(path, init);
}
