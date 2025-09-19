import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import AppProviders from '@/components/AppProviders';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
