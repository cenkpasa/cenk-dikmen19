import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/components/App';
import AppProviders from '@/components/AppProviders';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { seedDatabase } from '@/services/dbService';
import Loader from '@/components/common/Loader';

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
        <AppProviders>
            <App />
        </AppProviders>
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