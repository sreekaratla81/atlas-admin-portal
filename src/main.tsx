import App from '@/app/App';
import { API_BASE } from '@/shared/config/env';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './style.css';

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info('API base', API_BASE);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
