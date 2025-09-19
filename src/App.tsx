


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
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';

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
    const navigate = useNavigate();

    const { settings } = useSettings();
    const { addNotification } = useNotificationCenter();
    const { appointments, customers } = useData();

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
    
    // Effect for checking appointment reminders
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const sentReminders = new Set<string>(JSON.parse(sessionStorage.getItem('sentReminders') || '[]'));

            appointments.forEach(app => {
                if (!app.reminder || app.reminder === 'none' || sentReminders.has(app.id)) {
                    return;
                }

                const appStartTime = new Date(app.start);
                if (appStartTime < now) return; // Appointment is in the past

                let reminderTime = new Date(appStartTime);
                const durationMatch = app.reminder.match(/^(\d+)([mhd])$/); // 15m, 1h, 1d
                if (!durationMatch) return;

                const value = parseInt(durationMatch[1], 10);
                const unit = durationMatch[2];

                if (unit === 'm') reminderTime.setMinutes(reminderTime.getMinutes() - value);
                else if (unit === 'h') reminderTime.setHours(reminderTime.getHours() - value);
                else if (unit === 'd') reminderTime.setDate(reminderTime.getDate() - value);

                if (now >= reminderTime && now < appStartTime) {
                    const customer = customers.find(c => c.id === app.customerId);
                    addNotification({
                        messageKey: 'appointmentReminder',
                        replacements: {
                            title: app.title,
                            customerName: customer?.name || 'Bilinmeyen',
                            time: appStartTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                        },
                        type: 'appointment',
                        link: { page: 'appointments' }
                    });
                    
                    sentReminders.add(app.id);
                }
            });

            sessionStorage.setItem('sentReminders', JSON.stringify(Array.from(sentReminders)));
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        checkReminders(); // Initial check
        return () => clearInterval(intervalId);
    }, [appointments, customers, addNotification]);


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