import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { Appointment } from '../types';
import Button from '../components/common/Button';
import AppointmentForm from '../components/forms/AppointmentForm';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';

type ViewMode = 'day' | 'work-week' | 'week' | 'month';

const Appointments = () => {
    const { t, language } = useLanguage();
    const { appointments, customers, deleteAppointment, updateAppointment } = useData();
    const { showNotification } = useNotification();
    const { currentUser } = useAuth();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const canEdit = currentUser?.role === 'admin';

    if(!appointments) return <Loader fullScreen />;

    const handleOpenModal = (appointment?: Appointment | null, defaultDate?: Date) => {
        setSelectedAppointment(appointment || null);
        setIsFormModalOpen(true);
    };
    
    const handleCellClick = (date: Date) => {
        const newApt: Appointment = {
            id: '', customerId: '', userId: currentUser!.id, title: '',
            start: date.toISOString(),
            end: new Date(date.getTime() + 60 * 60 * 1000).toISOString()
        };
        setSelectedAppointment(newApt);
        setIsFormModalOpen(true);
    };
    
    const Header = () => (
        <div className="p-4 border-b border-cnk-border-light flex flex-wrap justify-between items-center gap-2 bg-cnk-panel-light">
            <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => handleCellClick(new Date())} icon="fas fa-plus">{t('appointmentCreate')}</Button>
                 <span className="border-l border-cnk-border-light h-8 mx-2"></span>
                <Button size="sm" variant="secondary" onClick={() => setCurrentDate(new Date())}>{t('today')}</Button>
                <div className="flex items-center">
                    <Button size="sm" variant="secondary" icon="fas fa-chevron-left" onClick={() => {
                        const newDate = new Date(currentDate);
                        if(viewMode === 'month') newDate.setMonth(currentDate.getMonth() - 1);
                        else if(viewMode === 'week' || viewMode === 'work-week') newDate.setDate(currentDate.getDate() - 7);
                        else newDate.setDate(currentDate.getDate() - 1);
                        setCurrentDate(newDate);
                    }}/>
                    <Button size="sm" variant="secondary" icon="fas fa-chevron-right" onClick={() => {
                        const newDate = new Date(currentDate);
                        if(viewMode === 'month') newDate.setMonth(currentDate.getMonth() + 1);
                        else if(viewMode === 'week' || viewMode === 'work-week') newDate.setDate(currentDate.getDate() + 7);
                        else newDate.setDate(currentDate.getDate() - 1);
                        setCurrentDate(newDate);
                    }}/>
                </div>
                 <h2 className="text-xl font-semibold text-cnk-txt-primary-light">{currentDate.toLocaleDateString(language, { year: 'numeric', month: 'long' })}</h2>
            </div>
            <div className="flex items-center gap-1 bg-cnk-bg-light p-1 rounded-cnk-element">
                {([ 'work-week', 'week', 'month'] as ViewMode[]).map(v => (
                    <Button key={v} size="sm" variant={viewMode === v ? 'primary' : 'secondary'} className={viewMode === v ? '' : '!bg-transparent shadow-none'} onClick={() => setViewMode(v)}>
                        {t(v.replace('-', ''))}
                    </Button>
                ))}
            </div>
        </div>
    );
    
    const MonthView = () => {
        const monthAppointments = useMemo(() => {
            return appointments.filter(app => {
                const appDate = new Date(app.start);
                return appDate.getMonth() === currentDate.getMonth() && appDate.getFullYear() === currentDate.getFullYear();
            });
        }, [appointments, currentDate]);

        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1; // Monday is 0
        const endDay = endOfMonth.getDate();

        const days = Array.from({ length: startDay + endDay }, (_, i) => {
            if (i < startDay) return null;
            const day = i - startDay + 1;
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        });
        
        const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

        return (
            <div className="flex-grow grid grid-cols-7" style={{ gridTemplateRows: 'auto 1fr 1fr 1fr 1fr 1fr 1fr'}}>
                {weekDays.map(day => <div key={day} className="text-center font-semibold p-2 border-b border-r border-cnk-border-light text-cnk-txt-secondary-light text-sm">{day}</div>)}
                {days.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} className="border-b border-r border-cnk-border-light"></div>;
                    
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayApps = monthAppointments.filter(app => new Date(app.start).toDateString() === day.toDateString());

                    return (
                        <div key={day.toISOString()} className="border-b border-r border-cnk-border-light p-1 overflow-y-auto" onClick={() => handleCellClick(day)}>
                            <p className={`text-sm text-right ${isToday ? 'font-bold text-cnk-accent-primary' : 'text-cnk-txt-muted-light'}`}>{day.getDate()}</p>
                            <div className="space-y-1">
                                {dayApps.map(app => (
                                    <div key={app.id} onClick={(e) => { e.stopPropagation(); handleOpenModal(app)}} className="bg-cnk-accent-primary/80 text-white rounded p-1 text-xs cursor-pointer truncate">
                                        {app.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col flex-grow border border-cnk-border-light rounded-cnk-card overflow-hidden shadow-md bg-cnk-panel-light">
                <Header />
                <MonthView />
            </div>
            {isFormModalOpen && 
                <AppointmentForm 
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    appointment={selectedAppointment}
                />
            }
        </div>
    );
};

export default Appointments;