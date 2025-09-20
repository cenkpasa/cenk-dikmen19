import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AppProviders } from '@/components/AppProviders';
import '@/styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Kök eleman bulunamadı.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);