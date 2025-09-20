import { User, Customer, LeaveRequest, Offer, MeetingForm, VehicleLog, Task, Expense } from "@/types";

export const initialUsers: User[] = [
    { id: 'admin-1', username: 'admin', password: '1234', adSoyad: 'Sistem Yöneticisi', role: 'Admin', photo: '...' },
    { id: 'user-1', username: 'muhasebe', password: '1234', adSoyad: 'Muhasebe Departmanı', role: 'Muhasebe', photo: '...' },
    { id: 'user-2', username: 'saha', password: '1234', adSoyad: 'Saha Personeli', role: 'Saha', photo: '...' },
    { id: 'user-3', username: 'gokhan', password: '123', adSoyad: 'Gökhan Hüseyin Gürlenkaya', role: 'Saha', photo: '...' },
    { id: 'user-4', username: 'hatice', password: '123', adSoyad: 'Hatice Kayretli', role: 'Muhasebe', photo: '...' },
    { id: 'user-5', username: 'ilker', password: '123', adSoyad: 'İlker Taya', role: 'Saha', photo: '...' },
    { id: 'user-6', username: 'can', password: '123', adSoyad: 'Can Köseoğlu', role: 'Saha', photo: '...' },
    { id: 'user-7', username: 'onat', password: '123', adSoyad: 'Onat Deniz Görür', role: 'Saha', photo: '...' },
];

export const initialCustomers: Omit<Customer, 'segment'>[] = [
    { id: 'cust-1', name: 'Örnek A.Ş.', contact: 'Ali Veli', phone: '05551112233', email: 'ali@ornekas.com', address: 'Ankara', ownerId: 'user-3', createdAt: '2023-05-10T10:00:00Z', visitCount: 8 },
    { id: 'cust-2', name: 'Test Firması Ltd.', contact: 'Ayşe Yılmaz', phone: '05324445566', email: 'ayse@test.com.tr', address: 'İstanbul', ownerId: 'user-5', createdAt: '2024-06-20T10:00:00Z', visitCount: 3 },
    { id: 'cust-3', name: 'Riskli Müşteri A.Ş.', contact: 'Mehmet Öztürk', phone: '05421234567', email: 'mehmet@riskli.com', address: 'İzmir', ownerId: 'user-3', createdAt: '2022-01-15T10:00:00Z', visitCount: 1 },
    { id: 'cust-4', name: 'Yeni Müşteri Ltd.', contact: 'Fatma Kaya', phone: '05339876543', email: 'fatma@yeni.com', address: 'Bursa', ownerId: 'user-6', createdAt: new Date().toISOString(), visitCount: 0 },
];

export const initialLeaveRequests: LeaveRequest[] = [
    { id: 'leave-1', userId: 'user-3', type: 'annual', startDate: '2024-08-10', endDate: '2024-08-15', reason: 'Yıllık izin kullanımı', status: 'approved', requestedAt: '2024-07-01T10:00:00Z' },
    { id: 'leave-2', userId: 'user-5', type: 'daily', startDate: '2024-07-25', endDate: '2024-07-25', reason: 'Doktor randevusu', status: 'pending', requestedAt: '2024-07-20T14:00:00Z' },
];

export const initialOffers: Offer[] = [
    { id: 'offer-1', offerNo: 'TEK-2024-001', customerId: 'cust-1', customerName: 'Örnek A.Ş.', userId: 'user-3', date: '2024-07-15', totalAmount: 15000 },
    { id: 'offer-2', offerNo: 'TEK-2024-002', customerId: 'cust-2', customerName: 'Test Firması Ltd.', userId: 'user-5', date: '2024-07-18', totalAmount: 27500 },
];

export const initialMeetingForms: MeetingForm[] = [
    { id: 'meet-1', customerId: 'cust-1', userId: 'user-3', notes: 'Müşteri ile yeni projeler hakkında görüşüldü. Özellikle XYZ projesi için takım ihtiyaçları konuşuldu.', createdAt: '2024-07-10T11:00:00Z', aiSummary: '' },
];

export const initialVehicleLogs: VehicleLog[] = [
    { id: 'log-1', userId: 'user-3', date: '2024-07-20', km: 150250, description: 'Örnek A.Ş. ziyareti' },
    { id: 'log-2', userId: 'user-3', date: '2024-07-19', km: 150100, description: 'Ofise dönüş' },
    { id: 'log-3', userId: 'user-5', date: '2024-07-20', km: 89540, description: 'Test Firması Ltd. görüşmesi' },
];

export const initialTasks: Task[] = [
    { id: 'task-1', title: 'Örnek A.Ş. teklifini hazırla', assignedToId: 'user-3', status: 'in-progress', dueDate: '2024-08-01', createdBy: 'admin-1' },
    { id: 'task-2', title: 'Test Firması Ltd. takip araması yap', assignedToId: 'user-5', status: 'pending', dueDate: '2024-07-30', createdBy: 'admin-1' },
    { id: 'task-3', title: 'Aylık satış raporunu tamamla', assignedToId: 'user-4', status: 'completed', dueDate: '2024-07-25', createdBy: 'admin-1' },
];

export const initialExpenses: Expense[] = [
    { id: 'exp-1', userId: 'user-3', category: 'yol', amount: 350, date: '2024-07-20', description: 'Örnek A.Ş. ziyareti yakıt masrafı' },
    { id: 'exp-2', userId: 'user-5', category: 'yemek', amount: 250, date: '2024-07-20', description: 'Test Firması ile öğle yemeği' },
];