export type Role = 'Admin' | 'Muhasebe' | 'Saha';

export interface User {
  id: string;
  username: string;
  password?: string;
  adSoyad: string;
  role: Role;
  photo: string;
}

export type CustomerSegment = 'Sadık' | 'Potansiyel' | 'Riskli' | 'Yeni';

export interface Customer {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    ownerId: string;
    createdAt: string;
    visitCount: number;
    segment: CustomerSegment;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    type: 'annual' | 'daily' | 'hourly';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
}

export interface ProductionTool {
    name: string;
    purpose: string;
    imageUrl: string;
}

export interface ProductionStep {
    description: string;
    estimatedTime: string;
    cost: number;
}

export interface ProductionQuote {
    dfmIssues: {
        issue: string;
        severity: 'Yüksek' | 'Orta' | 'Düşük';
        suggestion: string;
    }[];
    tools: ProductionTool[];
    steps: ProductionStep[];
    totalCost: number;
}


export interface Offer {
    id: string;
    offerNo: string;
    customerId: string;
    customerName: string;
    userId: string;
    date: string;
    totalAmount: number;
    details?: ProductionQuote;
}

export interface MeetingForm {
    id: string;
    customerId: string;
    userId: string;
    notes: string;
    createdAt: string;
    aiSummary: string;
}

export interface VehicleLog {
  id: string;
  userId: string;
  date: string;
  km: number;
  description: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
    id: string;
    title: string;
    assignedToId: string;
    status: TaskStatus;
    dueDate: string;
    createdBy: string;
}

export type ExpenseCategory = 'yol' | 'konaklama' | 'yemek' | 'temsil' | 'diger';

export interface Expense {
    id: string;
    userId: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
}

export type SearchableEntities = Customer | User | Offer | MeetingForm | Task | Expense;
export type SearchResultType = 'Müşteri' | 'Personel' | 'Teklif' | 'Görüşme' | 'Görev' | 'Gider';
export interface SearchResult {
    type: SearchResultType;
    item: SearchableEntities;
    title: string;
    id: string;
}

export interface DFMAnalysisResult {
    issue: string;
    severity: 'Yüksek' | 'Orta' | 'Düşük';
    suggestion: string;
}