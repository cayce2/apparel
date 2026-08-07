"use client";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="container-page my-24">
      <div className="rounded-lg bg-secondary px-6 py-16 text-center">
        <h2 className="font-display text-3xl">Stay in the loop</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">Early access to new arrivals, members-only sales, and styling notes. No spam.</p>
        {done ? (
          <p className="mt-6 text-sm">Thanks for subscribing.</p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="mx-auto mt-6 flex max-w-md gap-2"
          >
            <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
      </div>
    </section>
  );
}
