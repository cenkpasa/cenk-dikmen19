import React, { useState } from 'react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonnel } from '../../contexts/PersonnelContext';
import { useNotification } from '../../contexts/NotificationContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    personnel: User;
}

const LeaveRequestModal = ({ isOpen, onClose, personnel }: LeaveRequestModalProps) => {
    const { t } = useLanguage();
    const { addLeaveRequest } = usePersonnel();
    const { showNotification } = useNotification();

    const [requestData, setRequestData] = useState({
        type: 'Yıllık İzin',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setRequestData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        if (!requestData.startDate || !requestData.endDate) {
            showNotification('fieldsRequired', 'error');
            return;
        }
        addLeaveRequest({
            userId: personnel.id,
            ...requestData,
        }); // This will create a pending request by default
        showNotification('leaveRequestSuccess', 'success');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('leaveRequestModalTitle')}
            footer={<><Button variant="secondary" onClick={onClose}>{t('cancel')}</Button><Button onClick={handleSave}>{t('sendRequest')}</Button></>}
        >
            <div className="space-y-4">
                 <Input id="startDate" label="Başlangıç Tarihi" type="date" value={requestData.startDate} onChange={handleChange} />
                 <Input id="endDate" label="Bitiş Tarihi" type="date" value={requestData.endDate} onChange={handleChange} />
                 <div>
                    <label htmlFor="type" className="mb-2 block text-sm font-semibold">İzin Türü</label>
                    <select id="type" value={requestData.type} onChange={handleChange} className="w-full rounded-lg border border-cnk-border-light bg-cnk-bg-light p-2">
                        <option>Yıllık İzin</option>
                        <option>Raporlu</option>
                        <option>Ücretsiz İzin</option>
                        <option>Diğer</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="reason" className="mb-2 block text-sm font-semibold">Açıklama</label>
                    <textarea id="reason" value={requestData.reason} onChange={handleChange} rows={3} className="w-full rounded-lg border border-cnk-border-light bg-cnk-bg-light p-2"></textarea>
                 </div>
            </div>
        </Modal>
    );
};

export default LeaveRequestModal;