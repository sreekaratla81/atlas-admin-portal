import { useEffect, useState } from 'react';
import { ENV } from '@/config/env';
import { apiFetch } from '@/lib/http';

export default function DevConfig() {
  const [health, setHealth] = useState('');
  useEffect(() => {
    apiFetch('/api/health').then(r=>r.text()).then(setHealth).catch(e=>setHealth(String(e)));
  }, []);
  const redacted = { ...ENV, VITE_AUTH0_CLIENT_ID: '***', VITE_AUTH0_DOMAIN: '***' } as any;
  return (
    <pre>{JSON.stringify(redacted, null, 2)}\nhealth: {health}</pre>
  );
}
