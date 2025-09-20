import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import MainLayout from '@/components/layout/MainLayout';
import Loader from '@/components/common/Loader';

function App() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      {currentUser ? <MainLayout /> : <LoginPage />}
    </>
  );
}

export default App;
