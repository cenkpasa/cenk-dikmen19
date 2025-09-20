import React, { useState, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import { summarizeText } from '@/services/gemini.service';
import Loader from '@/components/common/Loader';
import { MeetingForm as MeetingFormType } from '@/types';

const MeetingFormEditor = ({ onSave, onCancel, formToEdit }: { onSave: (data: any) => void; onCancel: () => void; formToEdit?: MeetingFormType | null; }) => {
    const { customers } = useData();
    const { currentUser } = useAuth();
    const [customerId, setCustomerId] = useState(formToEdit?.customerId || customers[0]?.id || '');
    const [notes, setNotes] = useState(formToEdit?.notes || '');
    const [aiSummary, setAiSummary] = useState(formToEdit?.aiSummary || '');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSummarize = async () => {
        if (!notes) {
            alert("Lütfen önce notları girin.");
            return;
        }
        setIsSummarizing(true);
        try {
            const summary = await summarizeText(notes);
            setAiSummary(summary);
        } catch (error) {
            console.error(error);
            alert("Özetleme sırasında bir hata oluştu.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        onSave({ customerId, notes, userId: currentUser.id, aiSummary });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Müşteri</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Görüşme Notları</label>
                <textarea rows={10} value={notes} onChange={e => setNotes(e.target.value)} required />
            </div>
             <div className="form-group">
                <label>AI Özeti</label>
                <textarea rows={5} value={aiSummary} readOnly placeholder="Notları girdikten sonra AI ile özetleyebilirsiniz."/>
                <button type="button" className="btn btn-secondary" onClick={handleSummarize} disabled={isSummarizing || !notes} style={{marginTop: '0.5rem', width: 'auto'}}>
                    {isSummarizing ? <Loader /> : <><i className="fas fa-robot"></i> AI ile Özetle</>}
                </button>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>İptal</button>
                <button type="submit" className="btn">Kaydet</button>
            </div>
        </form>
    );
};


const MeetingFormsPage = () => {
    const { meetingForms, addMeetingForm, updateMeetingForm, customers, personnel } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data: Omit<MeetingFormType, 'id' | 'createdAt'>) => {
        const newId = addMeetingForm(data);
        const newForm = { ...data, id: newId, createdAt: new Date().toISOString() };
        if (data.aiSummary) {
            updateMeetingForm(newForm);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn" onClick={() => setIsModalOpen(true)} style={{width: 'auto'}}>Yeni Görüşme Formu</button>
            </div>
            <div className="card">
                 <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Müşteri</th>
                                <th>Oluşturan</th>
                                <th>Tarih</th>
                                <th>Eylemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetingForms.map(form => {
                                const customer = customers.find(c => c.id === form.customerId);
                                const user = personnel.find(p => p.id === form.userId);
                                return (
                                    <tr key={form.id}>
                                        <td>{customer?.name || 'Bilinmiyor'}</td>
                                        <td>{user?.adSoyad || 'Bilinmiyor'}</td>
                                        <td>{new Date(form.createdAt).toLocaleDateString('tr-TR')}</td>
                                        <td>{/* Eylem butonları buraya eklenebilir */}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Görüşme Formu">
                <MeetingFormEditor onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default MeetingFormsPage;
