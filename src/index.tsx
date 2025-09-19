import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { AppProviders } from '@/components/AppProviders';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders />
    </ErrorBoundary>
  </React.StrictMode>
);
