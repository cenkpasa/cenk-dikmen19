import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/common/Modal';
import { Task, TaskStatus, User } from '@/types';

const TaskForm = ({ onSave, onCancel }: { onSave: (data: Omit<Task, 'id' | 'status' | 'createdBy'>) => void; onCancel: () => void; }) => {
    const { personnel } = useData();
    const [title, setTitle] = useState('');
    const [assignedToId, setAssignedToId] = useState(personnel[0]?.id || '');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, assignedToId, dueDate });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Görev Başlığı</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Atanan Personel</label>
                <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)}>
                    {personnel.map(p => <option key={p.id} value={p.id}>{p.adSoyad}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label>Son Teslim Tarihi</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>İptal</button>
                <button type="submit" className="btn">Kaydet</button>
            </div>
        </form>
    );
};

const TasksPage = () => {
    const { tasks, personnel, addTask, updateTask } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

    const isAdmin = currentUser?.role === 'Admin';

    const filteredTasks = useMemo(() => {
        let userTasks = isAdmin ? tasks : tasks.filter(t => t.assignedToId === currentUser?.id || t.createdBy === currentUser?.id);
        if (filter !== 'all') {
            userTasks = userTasks.filter(t => t.status === filter);
        }
        return userTasks;
    }, [tasks, currentUser, filter, isAdmin]);

    const handleSaveTask = (data: Omit<Task, 'id' | 'status' | 'createdBy'>) => {
        if (!currentUser) return;
        addTask({ ...data, createdBy: currentUser.id });
        setIsModalOpen(false);
    };

    const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
        updateTask({ ...task, status: newStatus });
    };

    const getUserName = (userId: string) => personnel.find(p => p.id === userId)?.adSoyad || 'Bilinmiyor';

    const statusLabels: Record<TaskStatus, string> = {
        pending: 'Bekliyor',
        'in-progress': 'Devam Ediyor',
        completed: 'Tamamlandı'
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-filters">
                     <label>Durum:</label>
                     <select value={filter} onChange={e => setFilter(e.target.value as any)}>
                        <option value="all">Tümü</option>
                        <option value="pending">Bekliyor</option>
                        <option value="in-progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                    </select>
                </div>
                {isAdmin && <button className="btn" onClick={() => setIsModalOpen(true)} style={{width: 'auto'}}>Yeni Görev Oluştur</button>}
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Atanan</th>
                                <th>Son Tarih</th>
                                <th>Durum</th>
                                {isAdmin && <th>Eylemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(task => (
                                <tr key={task.id}>
                                    <td>{task.title}</td>
                                    <td>{getUserName(task.assignedToId)}</td>
                                    <td>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</td>
                                    <td><span className={`status-badge status-${task.status}`}>{statusLabels[task.status]}</span></td>
                                    {isAdmin && (
                                        <td className="action-buttons">
                                            {task.status !== 'pending' && <button className="btn btn-secondary btn-small" onClick={() => handleStatusChange(task, 'pending')}>Bekliyor</button>}
                                            {task.status !== 'in-progress' && <button className="btn btn-info btn-small" onClick={() => handleStatusChange(task, 'in-progress')}>Başlat</button>}
                                            {task.status !== 'completed' && <button className="btn btn-success btn-small" onClick={() => handleStatusChange(task, 'completed')}>Tamamla</button>}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Görev Oluştur">
                <TaskForm onSave={handleSaveTask} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default TasksPage;