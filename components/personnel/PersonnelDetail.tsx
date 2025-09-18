import React, { useState } from 'react';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../common/Button';
import PersonnelAbsenceTab from './PersonnelAbsenceTab';
import PersonnelPayslipTab from './PersonnelPayslipTab';
import VehicleKmTab from './VehicleKmTab';

const InfoItem = ({ label, value }: { label: string, value?: string | number }) => (
    <div>
        <p className="text-xs text-cnk-txt-muted-light">{label}</p>
        <p className="font-medium text-cnk-txt-secondary-light">{value || '-'}</p>
    </div>
);

interface PersonnelDetailProps {
    personnel: User;
    onEdit: () => void;
    isOwnProfile: boolean;
}

const PersonnelDetail = ({ personnel, onEdit, isOwnProfile }: PersonnelDetailProps) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('info');

    const tabs = [
        { id: 'info', label: t('personnelInfo') },
        { id: 'payslip', label: 'Bordro' },
        { id: 'absence', label: t('devamsizlik') },
        { id: 'vehicle', label: t('vehicleKmTracking') }
    ];

    return (
        <div className="bg-cnk-panel-light rounded-cnk-card shadow-md">
            {/* Header */}
            <div className="bg-cnk-accent-primary/10 p-6 rounded-t-cnk-card flex items-center space-x-6">
                <img src={personnel.avatar || `https://ui-avatars.com/api/?name=${personnel.name}&background=random`} alt={personnel.name} className="w-20 h-20 rounded-full border-4 border-cnk-accent-primary/50 object-cover"/>
                <div>
                    <h2 className="text-2xl font-bold text-cnk-txt-primary-light">{personnel.name}</h2>
                    <p className="text-cnk-accent-primary">{personnel.jobTitle || t(personnel.role)}</p>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-cnk-border-light px-6">
                <nav className="flex space-x-8 -mb-px overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === tab.id ? 'border-cnk-accent-primary text-cnk-accent-primary' : 'border-transparent text-cnk-txt-muted-light hover:text-cnk-txt-secondary-light hover:border-cnk-border-light'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'info' && (
                     <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-cnk-txt-primary-light">{t('generalInfo')}</h3>
                            <Button onClick={onEdit} icon="fas fa-pencil-alt" size="sm">{t('edit')}</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                                <InfoItem label="T.C No" value={personnel.tcNo} />
                                <InfoItem label={t('fullName')} value={personnel.name} />
                                <InfoItem label={t('jobTitle')} value={personnel.jobTitle} />
                                <InfoItem label={t('email')} value={personnel.username} />
                                <InfoItem label={t('role')} value={t(personnel.role)} />
                                <InfoItem label={t('phone')} value={personnel.phone} />
                                <InfoItem label={t('startDate')} value={personnel.startDate} />
                                <InfoItem label={t('workType')} value={personnel.workType} />
                                <InfoItem label={t('status')} value={personnel.employmentStatus} />
                                <InfoItem label="Sigorta No" value={personnel.insuranceNo} />
                                <InfoItem label={t('licensePlate')} value={personnel.licensePlate} />
                            </div>
                            <div className="md:col-span-4 flex justify-center md:justify-end mt-4 md:mt-0">
                                <img src={personnel.avatar || `https://ui-avatars.com/api/?name=${personnel.name}&background=random`} alt={personnel.name} className="w-32 h-32 rounded-full object-cover shadow-md"/>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'payslip' && <PersonnelPayslipTab personnel={personnel} />}
                {activeTab === 'absence' && <PersonnelAbsenceTab personnel={personnel} isOwnProfile={isOwnProfile} />}
                {activeTab === 'vehicle' && <VehicleKmTab personnel={personnel} />}
            </div>
        </div>
    );
};

export default PersonnelDetail;