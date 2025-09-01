import React from "react";
import { getAllowedEmails } from "../utils/env";
import { safeSome } from "../utils/array";

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  return safeSome(allowed, (x: string) => x.toLowerCase() === email.toLowerCase());
}

export default function RequireAuth({ user, children }: { user: any; children: React.ReactNode }) {
  const email = user?.email ?? null;
  if (!isEmailAllowed(email)) {
    return <div style={{ padding: 24 }}>Access restricted. Please contact admin.</div>;
  }
  return <>{children}</>;
}
