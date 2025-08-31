/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  vi.resetModules();
});

describe('ProtectedRoute', () => {
  it('renders children when bypass enabled', async () => {
    const loginWithRedirect = vi.fn();
    vi.doMock('./config', () => ({ BYPASS: true }));
    vi.doMock('@auth0/auth0-react', () => ({
      useAuth0: () => ({ isAuthenticated: false, isLoading: false, loginWithRedirect })
    }));
    const { default: ProtectedRoute } = await import('./ProtectedRoute');
    const { getByText } = render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(getByText('secret')).toBeInTheDocument();
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it('redirects when not authenticated and bypass disabled', async () => {
    const loginWithRedirect = vi.fn();
    vi.doMock('./config', () => ({ BYPASS: false }));
    vi.doMock('@auth0/auth0-react', () => ({
      useAuth0: () => ({ isAuthenticated: false, isLoading: false, loginWithRedirect })
    }));
    const { default: ProtectedRoute } = await import('./ProtectedRoute');
    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(loginWithRedirect).toHaveBeenCalled();
  });
});
