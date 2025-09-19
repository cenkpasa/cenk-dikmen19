
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from '../components/common/Loader';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';

const Dashboard = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <Loader fullScreen />;
    }

    if (!currentUser) {
        return <p>Kullanıcı bulunamadı.</p>;
    }

    return currentUser.role === 'admin' 
        ? <AdminDashboard /> 
        : <UserDashboard />;
};

export default Dashboard;
