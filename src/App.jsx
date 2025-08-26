import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Properties from './pages/Properties';
import Listings from './pages/Listings';
import Bookings from './pages/Bookings';
import Reports from './pages/Reports';
import Guests from './pages/Guests';
import BankAccountsPage from './pages/BankAccountsPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';

const App = () => {
  const { isAuthenticated, user, logout } = useAuth0();

  return (
    <BrowserRouter>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/properties">Properties</Link>{' '}
        <Link to="/listings">Listings</Link>{' '}
        <Link to="/bank-accounts">Bank Accounts</Link>{' '}
        <Link to="/guests">Guests</Link>{' '}
        <Link to="/">Bookings</Link>{' '}
        <Link to="/reports">Reports</Link>{' '}
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
