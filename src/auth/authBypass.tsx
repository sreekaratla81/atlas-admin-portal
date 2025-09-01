import React, { useEffect, useState } from 'react';
import { getAuthConfig } from '@/lib/env';

interface BypassUser {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
}

export function useAuthMaybeBypass() {
  const [bypassUser, setBypassUser] = useState<BypassUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cfg = getAuthConfig();

    async function loadBypass() {
      if (!import.meta.env.DEV) return;
      if (!cfg.bypass) return;

      try {
        const resp = await fetch('/auth-bypass.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: BypassUser = await resp.json();
        if (!cancelled) setBypassUser(data);
      } catch (err) {
        console.error('Auth bypass: failed loading /auth-bypass.json', err);
      }
    }

    loadBypass();
    return () => {
      cancelled = true;
    };
  }, []);

  return { bypassUser };
}
