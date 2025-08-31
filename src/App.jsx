import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Properties from './pages/Properties';
import Listings from './pages/Listings';
import Bookings from './pages/Bookings';
import Reports from './pages/Reports';
import Guests from './pages/Guests';
import BankAccountsPage from './pages/BankAccountsPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import { useAtlasAuth } from './auth/useAtlasAuth';
import { BYPASS } from './auth/config';

const App = () => {
  const { isAuthenticated, user, logout } = useAtlasAuth();

  return (
    <BrowserRouter>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/properties">Properties</Link>{' '}
        <Link to="/listings">Listings</Link>{' '}
        <Link to="/bank-accounts">Bank Accounts</Link>{' '}
        <Link to="/guests">Guests</Link>{' '}
        <Link to="/">Bookings</Link>{' '}
        <Link to="/reports">Reports</Link>{' '}
        {BYPASS && (
          <span style={{ marginLeft: 10, fontSize: '0.75rem', padding: '2px 4px', borderRadius: 4, backgroundColor: '#FEF08A' }}>
            AUTH BYPASS (LOCAL)
          </span>
        )}
        {isAuthenticated && (
          <span style={{ marginLeft: 10 }}>
            {user?.email}{' '}
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Logout
            </button>
          </span>
        )}
      </nav>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
        <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
        <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
