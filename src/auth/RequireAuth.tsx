import React from "react";
import { getAllowedEmails } from "../utils/env";

export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  if (!Array.isArray(allowed) || allowed.length === 0) return false;
  return allowed.some((x) => x.toLowerCase() === email.toLowerCase());
}

export default function RequireAuth({ user, children }: { user: any; children: React.ReactNode }) {
  const email = user?.email ?? null;
  if (!isEmailAllowed(email)) {
    return <div style={{ padding: 24 }}>Access restricted. Please contact admin.</div>;
  }
  return <>{children}</>;
}
