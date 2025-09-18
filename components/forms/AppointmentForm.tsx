import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Appointment } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../contexts/AuthContext';
import Autocomplete from '../common/Autocomplete';

interface AppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null | undefined;
}

const AppointmentForm = ({ isOpen, onClose, appointment }: AppointmentFormProps) => {
    const { customers, addAppointment, updateAppointment, deleteAppointment } = useData();
    const { t } = useLanguage();
    const { showNotification } = useNotification();
    const { currentUser } = useAuth();
    
    const getInitialState = () => {
        const start = appointment?.start ? new Date(appointment.start) : new Date();
        const end = appointment?.end ? new Date(appointment.end) : new Date(start.getTime() + 60 * 60000); // 1 hour later
        return {
            customerId: appointment?.customerId || '',
            title: appointment?.title || '',
            startDate: start.toISOString().slice(0, 10),
            startTime: start.toTimeString().slice(0, 5),
            endDate: end.toISOString().slice(0, 10),
            endTime: end.toTimeString().slice(0, 5),
            allDay: appointment?.allDay || false,
            location: appointment?.location || '',
            notes: appointment?.notes || '',
            reminder: appointment?.reminder || '15m',
        };
    };

    const [formData, setFormData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    }, [appointment, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({...prev, [id]: type === 'checkbox' ? checked : value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.customerId || !formData.title) {
            showNotification('fieldsRequired', 'error');
            return;
        }
        if (!currentUser) return;

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        const appointmentData: Omit<Appointment, 'id' | 'createdAt'> = {
            customerId: formData.customerId,
            userId: currentUser.id,
            title: formData.title,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
            allDay: formData.allDay,
            location: formData.location,
            notes: formData.notes,
            reminder: formData.reminder,
        };

        if(appointment && appointment.id) {
            updateAppointment({ ...appointment, ...appointmentData });
            showNotification('appointmentUpdated', 'success');
        } else {
            addAppointment(appointmentData);
            showNotification('appointmentAdded', 'success');
        }
        onClose();
    };

    const handleDelete = () => {
        if(appointment && appointment.id) {
            deleteAppointment(appointment.id);
            showNotification('appointmentDeleted', 'success');
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={""}
            size="2xl"
            footer={
                <div className="w-full flex justify-between">
                     {appointment && appointment.id ? 
                        <Button variant="danger" onClick={handleDelete} icon="fas fa-trash">{t('delete')}</Button> 
                        : <div></div>
                     }
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                        <Button variant="primary" onClick={handleSubmit} icon="fas fa-save">{t('save')}</Button>
                    </div>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="title" placeholder={t('addTitle')} value={formData.title} onChange={handleChange} required containerClassName="!mb-0" className="!text-xl !font-semibold !border-0 !shadow-none !p-0 focus:!ring-0" />
                
                <Autocomplete
                    items={customers.map(c => ({ id: c.id, name: c.name }))}
                    onSelect={(id) => setFormData(prev => ({...prev, customerId: id}))}
                    placeholder={t('searchCustomer')}
                    initialValue={customers.find(c => c.id === formData.customerId)?.name || ''}
                />

                 <div className="flex items-center gap-4">
                    <i className="fas fa-clock text-slate-500 w-5 text-center"></i>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={handleChange} required containerClassName="!mb-0 flex-grow" />
                    {!formData.allDay && <>
                        <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} required containerClassName="!mb-0" />
                        <span>-</span>
                        <Input id="endTime" type="time" value={formData.endTime} onChange={handleChange} required containerClassName="!mb-0" />
                    </>}
                    <label className="flex items-center gap-2"><input type="checkbox" id="allDay" checked={formData.allDay} onChange={handleChange}/>{t('allDay')}</label>
                </div>
                 <div className="flex items-center gap-4">
                    <i className="fas fa-bell text-slate-500 w-5 text-center"></i>
                    <select id="reminder" value={formData.reminder} onChange={handleChange} className="flex-grow rounded-lg border border-slate-300 bg-white px-3 py-2 text-text-dark shadow-sm">
                        <option value="none">{t('noReminder')}</option>
                        <option value="15m">{t('reminder15m')}</option>
                        <option value="1h">{t('reminder1h')}</option>
                        <option value="1d">{t('reminder1d')}</option>
                    </select>
                </div>
                <div className="flex items-center gap-4">
                    <i className="fas fa-map-marker-alt text-slate-500 w-5 text-center"></i>
                    <Input id="location" placeholder="Konum ara" value={formData.location} onChange={handleChange} containerClassName="!mb-0 flex-grow" />
                </div>
                 <div className="flex items-start gap-4">
                    <i className="fas fa-align-left text-slate-500 w-5 text-center mt-2"></i>
                     <textarea id="notes" placeholder={t('addDescription')} value={formData.notes} onChange={handleChange} rows={3} className="w-full flex-grow rounded-lg border border-slate-300 bg-white px-3 py-2 text-text-dark shadow-sm" />
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentForm;