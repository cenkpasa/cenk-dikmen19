import React, { useState, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest, User, VehicleLog } from '@/types';

const LeaveRequestForm = ({ onSubmit }: { onSubmit: (data: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt' | 'userId'>) => void }) => {
    const [type, setType] = useState<'annual' | 'daily' | 'hourly'>('daily');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ type, startDate, endDate, reason });
        setStartDate('');
        setEndDate('');
        setReason('');
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{marginTop: '1.5rem'}}>
            <h4>Yeni İzin Talebi</h4>
            <div className="form-group">
                <label>İzin Tipi</label>
                <select value={type} onChange={e => setType(e.target.value as any)}>
                    <option value="annual">Yıllık İzin</option>
                    <option value="daily">Günlük İzin</option>
                    <option value="hourly">Saatlik İzin</option>
                </select>
            </div>
            <div className="form-group">
                <label>Başlangıç Tarihi</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required/>
            </div>
             <div className="form-group">
                <label>Bitiş Tarihi</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
             <div className="form-group">
                <label>Açıklama</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} required />
            </div>
            <button className="btn" type="submit" style={{width: 'auto'}}>Talep Gönder</button>
        </form>
    )
}

const VehicleLogForm = ({ onSubmit }: { onSubmit: (data: Omit<VehicleLog, 'id' | 'userId'>) => void }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [km, setKm] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!km) return;
        onSubmit({ date, km: Number(km), description });
        setKm('');
        setDescription('');
    };
    
    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginTop: '1.5rem' }}>
            <h4>Yeni Kilometre Girişi</h4>
            <div className="form-group">
                <label>Tarih</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Kilometre</label>
                <input type="number" placeholder="Örn: 123456" value={km} onChange={e => setKm(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Açıklama (Opsiyonel)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Örn: Müşteri ziyareti" />
            </div>
            <button className="btn" type="submit" style={{ width: 'auto' }}>Kaydet</button>
        </form>
    )
}


const PersonnelPage = () => {
    const { personnel, leaveRequests, addLeaveRequest, updateLeaveRequestStatus, vehicleLogs, addVehicleLog } = useData();
    const { currentUser, updateUserPhoto } = useAuth();
    const [activeTab, setActiveTab] = useState('info');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = currentUser?.role === 'Admin';
    const isSaha = currentUser?.role === 'Saha';

    const handleSelectUser = (userId: string) => {
        setSelectedUserId(userId);
        setActiveTab('info');
    };

    const handleGoBack = () => setSelectedUserId(null);
    
    // Determine which user's details to display
    const targetUserId = isAdmin ? selectedUserId : currentUser?.id;
    const displayedUser = personnel.find(p => p.id === targetUserId);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && displayedUser) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUserPhoto(displayedUser.id, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    // If admin and no user is selected, show the list.
    if (isAdmin && !selectedUserId) {
        return (
            <div className="card">
                 <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ad Soyad</th>
                                <th>Kullanıcı Adı</th>
                                <th>Rol</th>
                                <th>Eylemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.map(p => (
                                <tr key={p.id}>
                                    <td>{p.adSoyad}</td>
                                    <td>{p.username}</td>
                                    <td>{p.role}</td>
                                    <td>
                                        <button className="btn btn-small" onClick={() => handleSelectUser(p.id)}>
                                            Detayları Gör
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    if (!displayedUser) {
        return <div className="card">Kullanıcı bulunamadı.</div>
    }

    const displayedUserLeaveRequests = leaveRequests.filter(r => r.userId === displayedUser.id);
    const displayedUserVehicleLogs = vehicleLogs.filter(log => log.userId === displayedUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div>
            {isAdmin && selectedUserId && (
                <button onClick={handleGoBack} className="btn-link" style={{marginBottom: '1rem'}}>
                    <i className="fas fa-arrow-left"></i> Personel Listesine Geri Dön
                </button>
            )}
             <div className="personnel-tabs">
                <button onClick={() => setActiveTab('info')} className={activeTab === 'info' ? 'active' : ''}>Genel Bilgiler</button>
                <button onClick={() => setActiveTab('leave')} className={activeTab === 'leave' ? 'active' : ''}>İzin Yönetimi</button>
                <button onClick={() => setActiveTab('vehicle')} className={activeTab === 'vehicle' ? 'active' : ''}>Araç Takibi</button>
            </div>

            {activeTab === 'info' && (
                 <div className="card">
                    <div className="profile-info-grid">
                        <div className="profile-photo-container">
                            {displayedUser.photo && displayedUser.photo !== '...' ? (
                                <img src={displayedUser.photo} alt="Profil" className="profile-photo" />
                            ) : (
                                <div className="profile-photo-placeholder">
                                    <i className="fas fa-user"></i>
                                </div>
                            )}
                            {(isAdmin || currentUser?.id === displayedUser.id) && (
                                <>
                                    <button className="btn btn-small profile-photo-edit" onClick={() => fileInputRef.current?.click()}>
                                        <i className="fas fa-camera"></i> Değiştir
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </>
                            )}
                        </div>
                        <div className="profile-details">
                            <h3>Personel Bilgileri</h3>
                            <p><strong>Ad Soyad:</strong> {displayedUser.adSoyad}</p>
                            <p><strong>Kullanıcı Adı:</strong> {displayedUser.username}</p>
                            <p><strong>Rol:</strong> {displayedUser.role}</p>
                        </div>
                    </div>
                </div>
            )}
             {activeTab === 'leave' && (
                <div>
                    {isSaha && currentUser?.id === displayedUser.id && <LeaveRequestForm onSubmit={(data) => addLeaveRequest({...data, userId: currentUser.id})} />}
                    <div className="card" style={{marginTop: '1.5rem'}}>
                        <h3>{displayedUser.adSoyad} - İzin Talepleri</h3>
                         <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {isAdmin && <th>Personel</th>}
                                        <th>Talep Tarihi</th>
                                        <th>Tip</th>
                                        <th>Başlangıç</th>
                                        <th>Durum</th>
                                        {isAdmin && <th>Eylemler</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUserLeaveRequests.map(req => (
                                        <tr key={req.id}>
                                            {isAdmin && <td>{displayedUser.adSoyad}</td>}
                                            <td>{new Date(req.requestedAt).toLocaleDateString('tr-TR')}</td>
                                            <td>{req.type}</td>
                                            <td>{new Date(req.startDate).toLocaleDateString('tr-TR')}</td>
                                            <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                                            {isAdmin && (
                                                <td className="action-buttons">
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => updateLeaveRequestStatus(req.id, 'approved')} className="btn btn-success btn-small" style={{width: 'auto'}}>Onayla</button>
                                                            <button onClick={() => updateLeaveRequestStatus(req.id, 'rejected')} className="btn btn-danger btn-small" style={{width: 'auto'}}>Reddet</button>
                                                        </>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
             )}
             {activeTab === 'vehicle' && (
                 <div>
                    {isSaha && currentUser?.id === displayedUser.id && <VehicleLogForm onSubmit={(data) => addVehicleLog({...data, userId: currentUser.id})} />}
                     <div className="card" style={{ marginTop: '1.5rem' }}>
                        <h3>{displayedUser.adSoyad} - Kilometre Geçmişi</h3>
                         <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {isAdmin && <th>Personel</th>}
                                        <th>Tarih</th>
                                        <th>Kilometre</th>
                                        <th>Açıklama</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedUserVehicleLogs.map(log => (
                                        <tr key={log.id}>
                                            {isAdmin && <td>{displayedUser.adSoyad}</td>}
                                            <td>{new Date(log.date).toLocaleDateString('tr-TR')}</td>
                                            <td>{log.km.toLocaleString('tr-TR')} km</td>
                                            <td>{log.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default PersonnelPage;