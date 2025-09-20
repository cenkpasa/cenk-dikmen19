import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/CustomersPage';
import PersonnelPage from '@/pages/PersonnelPage';
import NotFoundPage from '@/pages/NotFoundPage';
import OffersPage from '@/pages/OffersPage';
import MeetingFormsPage from '@/pages/MeetingFormsPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import TasksPage from '@/pages/TasksPage';
import ExpensesPage from '@/pages/ExpensesPage';
import ProductionAnalysisPage from '@/pages/ProductionAnalysisPage';
import WorkflowAutomationPage from '@/pages/WorkflowAutomationPage';
import LeaveReportPage from '@/pages/LeaveReportPage';
import FieldActivityReportPage from '@/pages/FieldActivityReportPage';

const MainLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const pageMap: { [key: string]: { component: React.ComponentType; title: string } } = {
    dashboard: { component: DashboardPage, title: 'Dashboard' },
    customers: { component: CustomersPage, title: 'Müşteriler' },
    personnel: { component: PersonnelPage, title: 'Personel Yönetimi' },
    offers: { component: OffersPage, title: 'Teklifler' },
    meetings: { component: MeetingFormsPage, title: 'Görüşme Formları' },
    tasks: { component: TasksPage, title: 'Görev Yönetimi' },
    expenses: { component: ExpensesPage, title: 'Gider Yönetimi' },
    leaveReport: { component: LeaveReportPage, title: 'İzin Raporu' },
    fieldActivityReport: { component: FieldActivityReportPage, title: 'Saha Faaliyet Raporu' },
    accounting: { component: () => <PlaceholderPage title="Muhasebe" />, title: 'Muhasebe' },
    production: { component: ProductionAnalysisPage, title: 'Üretim Analizi (3D)' },
    automation: { component: WorkflowAutomationPage, title: 'İş Akışı Otomasyonu' },
  };

  const currentPage = pageMap[activePage] || { component: NotFoundPage, title: 'Bulunamadı' };
  const PageComponent = currentPage.component;

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        <Header pageTitle={currentPage.title} />
        <PageComponent />
      </main>
    </div>
  );
};

export default MainLayout;