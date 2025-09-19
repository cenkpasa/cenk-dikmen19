import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from '@/components/AppProviders';
import { seedDatabase } from '@/services/dbService';
import Loader from '@/components/common/Loader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const AppInitializer = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initialize = async () => {
            try {
                await seedDatabase();
            } catch (error) {
                console.error("Database seeding failed:", error);
            } finally {
                setIsInitialized(true);
            }
        };
        initialize();
    }, []);

    if (!isInitialized) {
        return <Loader fullScreen={true} />;
    }

    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AppProviders />
        </QueryClientProvider>
      </BrowserRouter>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppInitializer />
    </ErrorBoundary>
  </React.StrictMode>
);