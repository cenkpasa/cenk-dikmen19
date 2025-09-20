import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import { Expense, ExpenseCategory, User } from '@/types';

const ExpenseForm = ({ onSave, onCancel }: { onSave: (data: Omit<Expense, 'id' | 'userId'>) => void; onCancel: () => void; }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('yol');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            setError('Lütfen geçerli bir tutar girin.');
            return;
        }
        setError('');
        onSave({ date, amount: Number(amount), category, description });
    };

    const categoryLabels: Record<ExpenseCategory, string> = {
        yol: 'Yol',
        konaklama: 'Konaklama',
        yemek: 'Yemek',
        temsil: 'Temsil/Ağırlama',
        diger: 'Diğer'
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Tarih</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Tutar (TL)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Örn: 150.50" required />
                {error && <p className="form-error">{error}</p>}
            </div>
            <div className="form-group">
                <label>Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Açıklama</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>İptal</button>
                <button type="submit" className="btn">Kaydet</button>
            </div>
        </form>
    );
};


const ExpensesPage = () => {
    const { expenses, personnel, addExpense } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredExpenses = useMemo(() => {
        if (currentUser?.role === 'Admin' || currentUser?.role === 'Muhasebe') {
            return expenses;
        }
        return expenses.filter(exp => exp.userId === currentUser?.id);
    }, [expenses, currentUser]);

    const handleSave = (data: Omit<Expense, 'id' | 'userId'>) => {
        if (!currentUser) return;
        addExpense({ ...data, userId: currentUser.id });
        setIsModalOpen(false);
    };

    const getUserName = (userId: string) => {
        return personnel.find(p => p.id === userId)?.adSoyad || 'Bilinmiyor';
    };

    return (
        <div>
            <div className="page-header">
                <h3>Giderler</h3>
                <button className="btn" onClick={() => setIsModalOpen(true)} style={{width: 'auto'}}>Yeni Gider Ekle</button>
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {(currentUser?.role === 'Admin' || currentUser?.role === 'Muhasebe') && <th>Personel</th>}
                                <th>Tarih</th>
                                <th>Kategori</th>
                                <th>Tutar</th>
                                <th>Açıklama</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(expense => (
                                <tr key={expense.id}>
                                     {(currentUser?.role === 'Admin' || currentUser?.role === 'Muhasebe') && <td>{getUserName(expense.userId)}</td>}
                                     <td>{new Date(expense.date).toLocaleDateString('tr-TR')}</td>
                                     <td>{expense.category}</td>
                                     <td>{expense.amount.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</td>
                                     <td>{expense.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Gider Ekle">
                <ExpenseForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ExpensesPage;