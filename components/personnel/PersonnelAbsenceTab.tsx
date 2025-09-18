import React, { useMemo, useState } from 'react';
import { User, LeaveRequest, ShiftAssignment } from '../../types';
import { usePersonnel } from '../../contexts/PersonnelContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DataTable from '../common/DataTable';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import LeaveRequestModal from './LeaveRequestModal';

const calculateLeaveDays = (startDateStr: string, endDateStr: string): number => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

const ManualLeaveModal = ({ isOpen, onClose, personnel }: { isOpen: boolean, onClose: () => void, personnel: User }) => {
    const { t } = useLanguage();
    const { addLeaveRequest } = usePersonnel();
    const [leaveData, setLeaveData] = useState({
        type: 'Yıllık İzin',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        reason: '',
        status: 'approved' as LeaveRequest['status']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setLeaveData(prev => ({...prev, [id]: value}));
    };

    const handleSave = () => {
        if (!leaveData.startDate || !leaveData.endDate) return;
        addLeaveRequest({
            userId: personnel.id,
            ...leaveData
        }, leaveData.status);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${personnel.name} - Manuel İzin Ekle`}
            footer={<><Button variant="secondary" onClick={onClose}>{t('cancel')}</Button><Button onClick={handleSave}>{t('save')}</Button></>}
        >
            <div className="space-y-4">
                <Input id="startDate" label="Başlangıç Tarihi" type="date" value={leaveData.startDate} onChange={handleChange} />
                <Input id="endDate" label="Bitiş Tarihi" type="date" value={leaveData.endDate} onChange={handleChange} />
                <Input id="reason" label="Açıklama" value={leaveData.reason} onChange={handleChange} />
                <div>
                    <label htmlFor="status" className="mb-2 block text-sm font-semibold">Durum</label>
                    <select id="status" value={leaveData.status} onChange={handleChange} className="w-full rounded-lg border p-2">
                        <option value="approved">{t('approved')}</option>
                        <option value="pending">{t('pending')}</option>
                        <option value="rejected">{t('rejected')}</option>
                    </select>
                </div>
            </div>
        </Modal>
    );
};


const StatCard = ({ label, value, colorClass }: { label: string; value: string | number; colorClass: string }) => (
    <div className={`p-4 rounded-lg text-center ${colorClass}`}>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

interface PersonnelAbsenceTabProps {
    personnel: User;
    isOwnProfile: boolean;
}

const PersonnelAbsenceTab = ({ personnel, isOwnProfile }: PersonnelAbsenceTabProps) => {
    const { t } = useLanguage();
    const { 
        getLeaveRequestsForUser, 
        approveLeaveRequest, 
        rejectLeaveRequest,
        getShiftAssignmentsForUser,
        shiftTemplates,
        deleteShiftAssignment
    } = usePersonnel();
    const { currentUser } = useAuth();
    const [isManualLeaveModalOpen, setIsManualLeaveModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const leaveHistory = useMemo(() => getLeaveRequestsForUser(personnel.id), [getLeaveRequestsForUser, personnel.id]);
    
    const usedLeaveDays = useMemo(() => {
        return leaveHistory
            .filter(req => req.status === 'approved' && req.type === 'Yıllık İzin')
            .reduce((total, req) => total + calculateLeaveDays(req.startDate, req.endDate), 0);
    }, [leaveHistory]);

    const remainingLeaveDays = (personnel.annualLeaveDays || 0) - usedLeaveDays;

    const getStatusClass = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending':
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const leaveHistoryColumns = [
        { header: t('date'), accessor: (item: LeaveRequest) => new Date(item.requestDate).toLocaleDateString() },
        { header: "Tür", accessor: (item: LeaveRequest) => item.type },
        { header: "Tarih Aralığı", accessor: (item: LeaveRequest) => `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}` },
        { 
            header: t('status'), 
            accessor: (item: LeaveRequest) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                    {t(item.status)}
                </span>
            )
        },
        ...(currentUser?.role === 'admin' ? [{
            header: t('actions'),
            accessor: (item: LeaveRequest) => (
                item.status === 'pending' ? (
                    <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => approveLeaveRequest(item.id)}>{t('approve')}</Button>
                        <Button size="sm" variant="danger" onClick={() => rejectLeaveRequest(item.id)}>{t('reject')}</Button>
                    </div>
                ) : null
            )
        }] : [])
    ];

    const shiftAssignments = useMemo(() => 
        getShiftAssignmentsForUser(personnel.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
        [getShiftAssignmentsForUser, personnel.id]
    );
    const shiftTemplateMap = new Map(shiftTemplates.map(st => [st.id, st]));

    const shiftColumns = [
        { 
            header: t('date'), 
            accessor: (item: ShiftAssignment) => new Date(item.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) 
        },
        { 
            header: "Vardiya Adı", 
            accessor: (item: ShiftAssignment) => shiftTemplateMap.get(item.shiftTemplateId)?.name || 'Bilinmeyen Vardiya'
        },
        { 
            header: "Başlangıç", 
            accessor: (item: ShiftAssignment) => shiftTemplateMap.get(item.shiftTemplateId)?.startTime
        },
        { 
            header: "Bitiş", 
            accessor: (item: ShiftAssignment) => shiftTemplateMap.get(item.shiftTemplateId)?.endTime
        },
        { 
            header: t('actions'), 
            accessor: (item: ShiftAssignment) => (
                 currentUser?.role === 'admin' && <Button variant="danger" size="sm" onClick={() => deleteShiftAssignment(item.id)} icon="fas fa-trash" />
            )
        }
    ];

    return (
        <div className="space-y-8">
            {isManualLeaveModalOpen && <ManualLeaveModal isOpen={isManualLeaveModalOpen} onClose={() => setIsManualLeaveModalOpen(false)} personnel={personnel} />}
            {isRequestModalOpen && <LeaveRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} personnel={personnel} />}
            
            <div>
                <h3 className="font-bold text-lg mb-4">İzin Yönetimi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <StatCard label={t('annualLeaveDays')} value={`${personnel.annualLeaveDays || 0} gün`} colorClass="bg-blue-500/10 text-blue-800" />
                    <StatCard label={t('usedLeave')} value={`${usedLeaveDays} gün`} colorClass="bg-orange-500/10 text-orange-800" />
                    <StatCard label={t('remainingLeave')} value={`${remainingLeaveDays} gün`} colorClass="bg-green-500/10 text-green-800" />
                </div>
                <div className="flex justify-end mb-4">
                    {currentUser?.role === 'admin' &&
                        <Button onClick={() => setIsManualLeaveModalOpen(true)} icon="fas fa-plus">Manuel İzin Ekle</Button>
                    }
                    {isOwnProfile &&
                        <Button onClick={() => setIsRequestModalOpen(true)} icon="fas fa-paper-plane">{t('requestLeave')}</Button>
                    }
                </div>
                <DataTable columns={leaveHistoryColumns} data={[...leaveHistory].reverse()} emptyStateMessage="İzin geçmişi bulunmuyor." />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-4">Atanmış Vardiyalar</h3>
                <DataTable
                    columns={shiftColumns}
                    data={shiftAssignments}
                    emptyStateMessage="Bu personele atanmış vardiya bulunmuyor."
                />
            </div>
        </div>
    );
};

export default PersonnelAbsenceTab;