import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#12102e',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.1)'
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: '#ffffff' } },
            }}
          />
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
