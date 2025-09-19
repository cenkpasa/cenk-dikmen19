import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import SidebarLeft from '@/components/layout/SidebarLeft';
import Header from '@/components/layout/Header';
import { useSettings } from '@/contexts/SettingsContext';
import { runAIAgent } from '@/services/aiAgentService';
import { useNotificationCenter } from '@/contexts/NotificationCenterContext';
import Loader from '@/components/common/Loader';
import CommandPalette from '@/components/common/CommandPalette';
import { syncService } from '@/services/syncService';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const Appointments = React.lazy(() => import('@/pages/Appointments'));
const InterviewFormPage = React.lazy(() => import('@/pages/InterviewFormPage'));
const OfferPage = React.lazy(() => import('@/pages/OfferPage'));
const Users = React.lazy(() => import('@/pages/Users'));
const CalculationToolsPage = React.lazy(() => import('@/pages/CalculationToolsPage'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const AIHubPage = React.lazy(() => import('@/pages/AIHubPage'));
const LocationTrackingPage = React.lazy(() => import('@/pages/LocationTrackingPage'));
const ErpIntegrationPage = React.lazy(() => import('@/pages/ErpIntegrationPage'));
const AISettingsPage = React.lazy(() => import('@/pages/AISettingsPage'));
const ReportPage = React.lazy(() => import('@/pages/ReportPage'));
const EmailDraftsPage = React.lazy(() => import('@/pages/EmailDraftsPage'));
const ReconciliationPage = React.lazy(() => import('@/pages/ReconciliationPage'));
const AuditLogPage = React.lazy(() => import('@/pages/AuditLogPage'));
const TechnicalInquiryPage = React.lazy(() => import('@/pages/TechnicalInquiryPage'));


const App = () => {
    const { currentUser, loading } = useAuth();
    const { NotificationContainer } = useNotification();
    const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    const { settings } = useSettings();
    const { addNotification } = useNotificationCenter();

    useEffect(() => {
        const initializeAIAgent = async () => {
            if (settings) {
                const insights = await runAIAgent(settings);
                await Promise.all(
                    insights.map(insight => addNotification(insight))
                );
            }
        };
        const timer = setTimeout(initializeAIAgent, 3000);
        return () => clearTimeout(timer);
    }, [settings, addNotification]);
    
    useEffect(() => {
        if (!currentUser) {
            setLeftSidebarOpen(false);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                setIsPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            console.log("Connection established. Synchronizing pending operations...");
            syncService.processSyncQueue();
        };
        window.addEventListener('online', handleOnline);
        if (navigator.onLine) {
            handleOnline();
        }
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const executeCommand = useCallback((action: () => void) => {
        action();
        setIsPaletteOpen(false);
    }, []);

    if (loading) {
        return <Loader fullScreen={true} />;
    }

    if (!currentUser) {
        return (
            <>
                <NotificationContainer />
                <Suspense fallback={<Loader fullScreen={true} />}>
                    <LoginPage />
                </Suspense>
            </>
        );
    }
    
    return (
        <div className="app-container grid min-h-screen bg-cnk-bg-light text-cnk-txt-secondary-light md:grid-cols-[260px_1fr]">
            <NotificationContainer />
            <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} executeCommand={executeCommand} />
            
            <SidebarLeft isOpen={isLeftSidebarOpen} setIsOpen={setLeftSidebarOpen} />
            
            <div className="flex flex-col flex-grow min-w-0">
                <Header 
                    onToggleLeftSidebar={() => setLeftSidebarOpen(true)}
                />
                <main className="main-content flex-grow overflow-y-auto bg-cnk-bg-light p-4 md:p-6">
                     <div id="page-content" className="min-h-[calc(100vh-120px)]">
                        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-120px)]"><Loader /></div>}>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/appointments" element={<Appointments />} />
                                <Route path="/interviews" element={<InterviewFormPage />} />
                                <Route path="/interviews/:id" element={<InterviewFormPage />} />
                                <Route path="/offers" element={<OfferPage />} />
                                <Route path="/offers/:id" element={<OfferPage />} />
                                <Route path="/reconciliations" element={<ReconciliationPage />} />
                                <Route path="/email-drafts" element={<EmailDraftsPage />} />
                                <Route path="/ai-hub" element={<AIHubPage />} />
                                <Route path="/reports" element={<ReportPage />} />
                                <Route path="/audit-log" element={<AuditLogPage />} />
                                <Route path="/personnel" element={<Users />} />
                                <Route path="/location-tracking" element={<LocationTrackingPage />} />
                                <Route path="/erp" element={<ErpIntegrationPage />} />
                                <Route path="/calculators" element={<CalculationToolsPage />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/ai-settings" element={<AISettingsPage />} />
                                <Route path="/technical-inquiries/:id" element={<TechnicalInquiryPage />} />
                                <Route path="*" element={<Dashboard />} />
                            </Routes>
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
