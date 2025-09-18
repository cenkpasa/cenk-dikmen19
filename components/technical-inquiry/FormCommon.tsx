import React, { ChangeEvent } from 'react';
import { TechnicalInquiry, Customer } from '../../types';
import Autocomplete from '../common/Autocomplete';
import { useData } from '../../contexts/DataContext';
import Button from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';

export const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border border-cnk-border-light p-3 rounded-md">
        <h3 className="font-bold mb-2 text-cnk-txt-primary-light">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

export const FormField = ({ label, value, onChange, isReadOnly, type = 'text', inline = false, children }: { label: string, value: string | number, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, isReadOnly?: boolean, type?: string, inline?: boolean, children?: React.ReactNode }) => (
    <div className={inline ? 'flex items-center gap-2' : ''}>
        <label className={`block text-sm font-medium text-cnk-txt-secondary-light ${inline ? 'w-12 flex-shrink-0' : 'mb-1'}`}>{label}</label>
        {type === 'textarea' ? (
             <textarea value={value} onChange={onChange} readOnly={isReadOnly} rows={4} className="w-full p-2 border rounded-md bg-cnk-bg-light" />
        ) : (
             <input type={type} value={value} onChange={onChange} readOnly={isReadOnly} className="w-full p-2 border rounded-md bg-cnk-bg-light" />
        )}
        {children}
    </div>
);

export const Checkbox = ({ name, label, checked, onChange, isReadOnly }: { name: string, label: string, checked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, isReadOnly?: boolean }) => (
    <label htmlFor={name} className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" id={name} name={name} checked={checked} onChange={onChange} disabled={isReadOnly} className="h-4 w-4 rounded" />
        <span>{label}</span>
    </label>
)

export const ImageRadio = ({ name, value, label, checked, onChange, image, isReadOnly }: { name: string, value: string, label?: string, checked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, image?: string, isReadOnly?: boolean }) => (
    <label className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border-2 ${checked ? 'border-cnk-accent-primary bg-cnk-accent-primary/10' : 'border-transparent hover:bg-cnk-bg-light'}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={isReadOnly} className="h-4 w-4" />
        {image && <img src={image} alt={label || value} className="h-8 w-8 object-contain" />}
        {label && <span>{label}</span>}
    </label>
);

interface FormHeaderProps {
    title: string;
    state: TechnicalInquiry;
    onCustomerSelect: (id: string) => void;
    onChange: (field: string, value: any) => void;
    isReadOnly?: boolean;
}

export const FormHeader = ({ title, state, onCustomerSelect, onChange, isReadOnly }: FormHeaderProps) => {
    const { customers } = useData();
    const { t } = useLanguage();

    return (
        <div className="border-b-2 border-cnk-border-light pb-4 mb-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <div className="w-1/3">
                    <Autocomplete
                        items={customers.map(c => ({ id: c.id, name: c.name }))}
                        onSelect={onCustomerSelect}
                        placeholder={t('selectCustomer')}
                        initialValue={customers.find(c => c.id === state.customerId)?.name || state.company || ''}
                        disabled={isReadOnly}
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="Firma" value={state.company} onChange={e => onChange('company', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Yetkili" value={state.contactPerson} onChange={e => onChange('contactPerson', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Müşteri No" value={state.customerNo} onChange={e => onChange('customerNo', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="E-Posta" value={state.email} onChange={e => onChange('email', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Telefon" value={state.phone} onChange={e => onChange('phone', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Faks" value={state.fax} onChange={e => onChange('fax', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Adres" value={state.address} onChange={e => onChange('address', e.target.value)} isReadOnly={isReadOnly} />
                <FormField label="Ülke" value={state.country} onChange={e => onChange('country', e.target.value)} isReadOnly={isReadOnly} />
            </div>
        </div>
    );
};

interface FormActionsProps {
    isReadOnly?: boolean;
    onSave: () => void;
    onPreview: () => void;
    onExport: () => void;
}

export const FormActions = ({ isReadOnly, onSave, onPreview, onExport }: FormActionsProps) => {
    const { t } = useLanguage();
    if(isReadOnly) return null;

    return (
        <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-cnk-border-light">
            <Button onClick={onPreview} variant="secondary" icon="fas fa-eye">{t('preview')}</Button>
            <Button onClick={() => onExport()} variant="info" icon="fas fa-file-pdf">{t('downloadPdf')}</Button>
            <Button onClick={onSave} icon="fas fa-save">{t('save')}</Button>
        </div>
    )
};