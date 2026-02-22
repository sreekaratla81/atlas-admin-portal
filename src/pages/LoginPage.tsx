import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/bookings', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f5f6fa',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.1)',
        width: '100%', maxWidth: 400,
      }}>
        <h1 style={{ marginBottom: 24, fontSize: 20, textAlign: 'center' }}>Atlas Admin</h1>

        {error && (
          <div style={{ color: '#e53e3e', background: '#fff5f5', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Email</span>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required autoFocus
            style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 24 }}>
          <span style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Password</span>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
          />
        </label>

        <button
          type="submit" disabled={isLoading}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 4, border: 'none',
            background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
