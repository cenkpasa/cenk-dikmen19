



import Dexie, { type Table } from 'dexie';
import { User, Customer, Appointment, Interview, Offer, ErpSettings, StokOgeleri, Notification, LeaveRequest, KmRecord, LocationRecord, AISettings, EmailDraft, Reconciliation, CalculatorState, CalculationHistoryItem, IncomingInvoice, OutgoingInvoice, AuditLog, ShiftTemplate, ShiftAssignment, Warehouse, StockLevel, SyncQueueItem, PayslipEntry, FinancialPlan, FinancialPlanItem, TechnicalInquiry, Fatura } from '../types';
import { DEFAULT_ADMIN, MOCK_APPOINTMENTS, MOCK_CUSTOMERS, MOCK_FINANCIAL_PLAN_2025 } from '../constants';
import { MOCK_INCOMING_INVOICES, MOCK_OUTGOING_INVOICES } from './erpMockData';
import { v4 as uuidv4 } from 'uuid';

export class AppDatabase extends Dexie {
    users!: Table<User, string>;
    customers!: Table<Customer, string>;
    appointments!: Table<Appointment, string>;
    interviews!: Table<Interview, string>;
    offers!: Table<Offer, string>;
    erpSettings!: Table<ErpSettings, 'default'>;
    stockItems!: Table<StokOgeleri, string>;
    invoices!: Table<Fatura, string>;
    notifications!: Table<Notification, string>;
    leaveRequests!: Table<LeaveRequest, string>;
    kmRecords!: Table<KmRecord, string>;
    locationHistory!: Table<LocationRecord, string>;
    aiSettings!: Table<AISettings, string>;
    emailDrafts!: Table<EmailDraft, string>;
    reconciliations!: Table<Reconciliation, string>;
    calculatorState!: Table<CalculatorState, 'default'>;
    calculationHistory!: Table<CalculationHistoryItem, number>;
    incomingInvoices!: Table<IncomingInvoice, string>;
    outgoingInvoices!: Table<OutgoingInvoice, string>;
    auditLogs!: Table<AuditLog, number>;
    shiftTemplates!: Table<ShiftTemplate, string>;
    shiftAssignments!: Table<ShiftAssignment, string>;
    warehouses!: Table<Warehouse, string>;
    stockLevels!: Table<StockLevel, string>;
    syncQueue!: Table<SyncQueueItem, number>;
    payslipEntries!: Table<PayslipEntry, string>;
    financialPlans!: Table<FinancialPlan, string>;
    financialPlanItems!: Table<FinancialPlanItem, string>;
    technicalInquiries!: Table<TechnicalInquiry, string>;


    constructor() {
        super('CnkCrmDatabase');
        (this as Dexie).version(35).stores({
            users: 'id, &username',
            customers: 'id, &currentCode, name, createdAt, status',
            appointments: 'id, customerId, start, userId',
            interviews: 'id, customerId, formTarihi, userId',
            offers: 'id, customerId, &teklifNo, createdAt, userId',
            erpSettings: 'id',
            stockItems: 'id, &kod, ad',
            invoices: 'id, &faturaNo, musteriId, kullaniciId, tarih',
            notifications: 'id, timestamp, isRead',
            leaveRequests: 'id, userId, requestDate, status',
            kmRecords: 'id, userId, date',
            locationHistory: 'id, userId, timestamp',
            aiSettings: 'userId',
            emailDrafts: 'id, createdAt, status, relatedObjectId',
            reconciliations: 'id, customerId, status, period, createdAt',
            calculatorState: 'id',
            calculationHistory: '++id, timestamp',
            incomingInvoices: '&faturaNo, vergiNo, tarih',
            outgoingInvoices: '&faturaNo, vergiNo, tarih',
            auditLogs: '++id, userId, entityId, timestamp',
            shiftTemplates: 'id, name',
            shiftAssignments: 'id, &[personnelId+date]',
            warehouses: 'id, &code',
            stockLevels: 'id, &[stockItemId+warehouseCode]',
            syncQueue: '++id, timestamp',
            payslipEntries: 'id, &[userId+period]',
            financialPlans: 'id, year',
            financialPlanItems: 'id, planId, category',
            technicalInquiries: 'id, customerId, type, createdAt, interviewId',
        });
    }
}

export const db = new AppDatabase();

const MOCK_USERS_PAYSLIP: User[] = [
    { id: 'user-goksel', username: 'goksel@cnkkesicitakim.com.tr', password: '1234', role: 'saha', name: 'GÖKSEL HÜSEYİN GÜRLENKAYA', jobTitle: 'Satış Temsilcisi', tcNo: '12958069404', insuranceNo: '12958069404', startDate: '2023-12-01', employmentStatus: 'Aktif' },
    { id: 'user-hatice', username: 'hatice@cnkkesicitakim.com.tr', password: '1234', role: 'muhasebe', name: 'HATİCE KAYRETLİ', jobTitle: 'Muhasebe Uzmanı', tcNo: '10255243282', insuranceNo: '10255243282', startDate: '2025-01-22', employmentStatus: 'Aktif' },
    { id: 'user-ilker', username: 'ilker@cnkkesicitakim.com.tr', password: '1234', role: 'saha', name: 'İLKER TAYA', jobTitle: 'Satış Temsilcisi', tcNo: '10298249128', insuranceNo: '10298249128', startDate: '2025-04-21', employmentStatus: 'Aktif' },
    { id: 'user-can', username: 'can@cnkkesicitakim.com.tr', password: '1234', role: 'saha', name: 'CAN KÖSEOĞLU', jobTitle: 'Satış Temsilcisi', tcNo: '12517644752', insuranceNo: '12517644752', startDate: '2025-07-26', employmentStatus: 'Aktif' },
    { id: 'user-onat', username: 'onat@cnkkesicitakim.com.tr', password: '1234', role: 'saha', name: 'ONAT DENİZ GÖRÜR', jobTitle: 'Satış Temsilcisi', tcNo: '25069544678', insuranceNo: '25069544678', startDate: '2025-07-26', employmentStatus: 'Aktif' },
];

const MOCK_PAYSLIP_ENTRIES: PayslipEntry[] = [
    { id: uuidv4(), userId: 'user-goksel', period: '2025-08', paymentType: 'AYLIK', startDate: '2023-12-01', grossPay: 41894.14, overtime: 0, taxBase: 35610.02, insuranceBase: 41894.14, incomeTax: 2864.43, insuranceCut: 5865.18, stampTax: 120.59, unemploymentCut: 418.94, netPay: 32625.00 },
    { id: uuidv4(), userId: 'user-hatice', period: '2025-08', paymentType: 'AYLIK', startDate: '2025-01-22', grossPay: 9803.92, overtime: 0, taxBase: 8333.33, insuranceBase: 9803.92, incomeTax: 0, insuranceCut: 1372.55, stampTax: 0, unemploymentCut: 98.04, netPay: 8333.33 },
    { id: uuidv4(), userId: 'user-ilker', period: '2025-08', paymentType: 'AYLIK', startDate: '2025-04-21', grossPay: 28889.77, overtime: 0, taxBase: 24556.30, insuranceBase: 28889.77, incomeTax: 367.74, insuranceCut: 4044.57, stampTax: 21.89, unemploymentCut: 288.90, netPay: 24166.67 },
    { id: uuidv4(), userId: 'user-can', period: '2025-08', paymentType: 'AYLIK', startDate: '2025-07-26', grossPay: 32852.96, overtime: 0, taxBase: 27925.02, insuranceBase: 32852.96, incomeTax: 873.05, insuranceCut: 4599.41, stampTax: 51.97, unemploymentCut: 328.53, netPay: 27000.00 },
    { id: uuidv4(), userId: 'user-onat', period: '2025-08', paymentType: 'AYLIK', startDate: '2025-07-26', grossPay: 19070.70, overtime: 0, taxBase: 16210.09, insuranceBase: 19070.70, incomeTax: 0, insuranceCut: 2669.90, stampTax: 0, unemploymentCut: 190.71, netPay: 16210.09 },
];


export const seedInitialData = async () => {
    try {
        await (db as Dexie).transaction('rw', db.tables, async () => {
            if ((await db.incomingInvoices.count()) === 0) {
                const incomingWithIds = MOCK_INCOMING_INVOICES.map(inv => ({ ...inv }));
                await db.incomingInvoices.bulkAdd(incomingWithIds);
            }
            if ((await db.outgoingInvoices.count()) === 0) {
                const outgoingWithIds = MOCK_OUTGOING_INVOICES.map(inv => ({ ...inv }));
                await db.outgoingInvoices.bulkAdd(outgoingWithIds);
            }
             if ((await db.financialPlans.count()) === 0) {
                await db.financialPlans.add(MOCK_FINANCIAL_PLAN_2025.plan);
                await db.financialPlanItems.bulkAdd(MOCK_FINANCIAL_PLAN_2025.items);
            }
        });
        console.log("Sample invoice and financial data seeded successfully.");
    } catch (error) {
        console.error("Failed to seed sample data:", error);
    }
};

export const seedDatabase = async () => {
    try {
        const userCount = await db.users.count();
        if (userCount > 1) { 
            console.log("Database already contains user data. Skipping main seed.");
            await seedInitialData(); 
            return;
        }

        console.log("Database is empty or only has admin. Initializing with default data...");

        const adminUser: User = { 
            id: 'admin-default', 
            ...DEFAULT_ADMIN, 
            password: DEFAULT_ADMIN.password || '1234',
        };
        
        const defaultShiftTemplates: ShiftTemplate[] = [
            { id: 'sabah', name: 'Sabah Vardiyası', startTime: '08:00', endTime: '16:00' },
            { id: 'aksam', name: 'Akşam Vardiyası', startTime: '16:00', endTime: '00:00' },
            { id: 'gece', name: 'Gece Vardiyası', startTime: '00:00', endTime: '08:00' },
        ];

        const defaultWarehouses: Warehouse[] = [
            { id: 'merkez', code: 'MERKEZ', name: 'Merkez Depo' },
            { id: 'sube-a', code: 'SUBE-A', name: 'A Şubesi Deposu' },
        ];

        await (db as Dexie).transaction('rw', db.tables, async () => {
            await db.users.clear();
            await db.users.bulkPut([adminUser, ...MOCK_USERS_PAYSLIP]);
            await db.payslipEntries.bulkPut(MOCK_PAYSLIP_ENTRIES);
            
            await db.shiftTemplates.bulkAdd(defaultShiftTemplates);
            await db.warehouses.bulkAdd(defaultWarehouses);

            if (MOCK_CUSTOMERS.length > 0) {
                const customersToSeed: Customer[] = MOCK_CUSTOMERS.map((c, i) => ({
                    ...c,
                    id: (i + 1).toString(),
                    createdAt: new Date().toISOString(),
                    synced: true,
                }));
                await db.customers.bulkAdd(customersToSeed);
            }
            if (MOCK_APPOINTMENTS.length > 0) {
              const appointmentsToSeed: Appointment[] = MOCK_APPOINTMENTS.map((a, i) => ({
                  ...a,
                  id: `mock-apt-${i + 1}`,
                  userId: 'user-goksel', 
                  createdAt: new Date().toISOString()
              }));
              await db.appointments.bulkAdd(appointmentsToSeed);
            }
            await db.erpSettings.put({ id: 'default', server: 'http://78.176.145.219:1904/$/', username: 'SYSDBA', isConnected: false });
        });
        
        await seedInitialData();

        console.log("Database seeded successfully with payslip data.");

    } catch (error) {
        console.error("Failed to seed database:", error);
        throw error;
    }
};