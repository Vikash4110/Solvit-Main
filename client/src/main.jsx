// File: src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CounselorAuthProvider } from './contexts/CounselorAuthContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ClientAuthProvider>
      <CounselorAuthProvider>
        <App />
      </CounselorAuthProvider>
    </ClientAuthProvider>
  </BrowserRouter>
);
