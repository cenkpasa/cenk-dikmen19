
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { usePersonnel } from '../../contexts/PersonnelContext';
import { formatCurrency, formatDate } from '../../utils/formatting';
import EmptyState from '../common/EmptyState';

const InfoCard = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-cnk-bg-light p-4 rounded-lg border border-cnk-border-light ${className}`}>
        <h4 className="font-bold text-cnk-accent-primary mb-3 pb-2 border-b border-cnk-border-light">{title}</h4>
        <div className="space-y-2 text-sm">{children}</div>
    </div>
);

const InfoRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center">
        <span className="text-cnk-txt-muted-light">{label}:</span>
        <span className="font-semibold text-cnk-txt-secondary-light">{value}</span>
    </div>
);

const PersonnelPayslipTab = ({ personnel }: { personnel: User }) => {
    // For now, we only have data for one period. In the future, this could fetch available periods.
    const [selectedPeriod, setSelectedPeriod] = useState('2025-08');
    const { getPayslipEntriesForUser } = usePersonnel();

    const payslipData = useMemo(() => {
        return getPayslipEntriesForUser(personnel.id, selectedPeriod);
    }, [personnel.id, selectedPeriod, getPayslipEntriesForUser]);

    const totalEarnings = (payslipData?.grossPay || 0) + (payslipData?.overtime || 0);
    const totalDeductions = (payslipData?.incomeTax || 0) + (payslipData?.insuranceCut || 0) + (payslipData?.stampTax || 0) + (payslipData?.unemploymentCut || 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <label htmlFor="period-select" className="font-medium">Dönem:</label>
                <select 
                    id="period-select" 
                    value={selectedPeriod} 
                    onChange={e => setSelectedPeriod(e.target.value)}
                    className="p-2 border rounded-md bg-cnk-panel-light"
                >
                    <option value="2025-08">Ağustos 2025</option>
                    {/* Future periods would be populated here */}
                </select>
            </div>

            {payslipData ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoCard title="Genel Bilgiler">
                            <InfoRow label="Ödeme Şekli" value={payslipData.paymentType} />
                            <InfoRow label="İşe Başlama" value={formatDate(payslipData.startDate)} />
                            <InfoRow label="Sigorta No" value={personnel.insuranceNo || '-'} />
                        </InfoCard>
                         <InfoCard title="Matrah Bilgileri">
                            <InfoRow label="Vergi Matrahı" value={formatCurrency(payslipData.taxBase, 'TRY')} />
                            <InfoRow label="Sigorta Matrahı" value={formatCurrency(payslipData.insuranceBase, 'TRY')} />
                        </InfoCard>
                        <div className="bg-green-600 text-white p-4 rounded-lg flex flex-col justify-center items-center text-center shadow-lg">
                            <span className="text-sm opacity-80">NET ÖDENECEK</span>
                            <span className="text-4xl font-bold tracking-tight">{formatCurrency(payslipData.netPay, 'TRY')}</span>
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard title="Hakedişler">
                             <InfoRow label="Brüt Ücret" value={formatCurrency(payslipData.grossPay, 'TRY')} />
                             <InfoRow label="Fazla Mesai" value={formatCurrency(payslipData.overtime, 'TRY')} />
                             <hr className="my-2 border-cnk-border-light"/>
                             <InfoRow label="TOPLAM KAZANÇ" value={formatCurrency(totalEarnings, 'TRY')} />
                        </InfoCard>
                         <InfoCard title="Kesintiler">
                            <InfoRow label="Gelir Vergisi" value={formatCurrency(payslipData.incomeTax, 'TRY')} />
                            <InfoRow label="SGK Primi" value={formatCurrency(payslipData.insuranceCut, 'TRY')} />
                            <InfoRow label="İşsizlik Sig." value={formatCurrency(payslipData.unemploymentCut, 'TRY')} />
                            <InfoRow label="Damga Vergisi" value={formatCurrency(payslipData.stampTax, 'TRY')} />
                            <hr className="my-2 border-cnk-border-light"/>
                            <InfoRow label="TOPLAM KESİNTİ" value={formatCurrency(totalDeductions, 'TRY')} />
                        </InfoCard>
                    </div>

                </div>
            ) : (
                <EmptyState 
                    icon="fas fa-file-invoice-dollar" 
                    message="Seçili dönem için bordro verisi bulunamadı." 
                />
            )}
        </div>
    );
};

export default PersonnelPayslipTab;
