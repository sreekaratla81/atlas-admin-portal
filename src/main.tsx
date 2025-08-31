import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import DevAuthProvider from './auth/DevAuthProvider';
import { BYPASS } from './auth/config';
import './style.css';

const Provider = BYPASS ? DevAuthProvider : AuthProvider;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
);
