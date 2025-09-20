import React from 'react';
import { useData } from '@/contexts/DataContext';

const DashboardPage = () => {
  const { customers, personnel, leaveRequests, offers } = useData();
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="dashboard-grid">
        <div className="card">
            <h3>Toplam Müşteri</h3>
            <p className="card-stat">{customers.length}</p>
        </div>
        <div className="card">
            <h3>Toplam Personel</h3>
            <p className="card-stat">{personnel.length}</p>
        </div>
        <div className="card">
            <h3>Bekleyen İzin Talepleri</h3>
            <p className="card-stat">{pendingLeaves}</p>
        </div>
        <div className="card">
            <h3>Aktif Teklifler</h3>
            <p className="card-stat">{offers.length}</p>
        </div>
    </div>
  );
};

export default DashboardPage;
