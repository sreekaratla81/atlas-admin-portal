import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(() => window.localStorage.getItem('atlas_token') ?? '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    window.localStorage.setItem('atlas_token', token);
    const redirectTo =
      (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste a valid API token to access the admin portal.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="token">
            API Token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
            placeholder="sk_live_xxx"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
