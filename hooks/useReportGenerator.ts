


import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useErp } from '@/contexts/ErpContext';
import { User, Invoice, Interview, Customer, Offer, ReportType, KmRecord, LocationRecord } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersonnel } from '@/contexts/PersonnelContext';
import { COMPANY_INFO } from '@/constants';
import { formatCurrency } from '@/utils/formatting';

export interface ReportFilters {
    reportType: ReportType;
    dateRange: { start: string, end: string };
    userId?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Araç Kiralama': ['kiralama', 'araç'],
    'Kesici Takım': ['takım', 'freze', 'matkap', 'uç', 'kesici', 'klavuz', 'pafta', 'kalem', 'kater', 'pens', 'matkap'],
    'Teknik Hırdavat': ['hırdavat', 'vantilatör', 'civata', 'yay', 'kumpas', 'mengen', 'aparat', 'testere', 'pim'],
    'Hizmet': ['hizmet', 'danışmanlık', 'bedeli', 'izleme', 'kontrol', 'e-fatura', 'kontör'],
    'Akaryakıt': ['petrol', 'diesel', 'yakıt', 'kurşunsuz', 'benzin'],
    'Kargo & Lojistik': ['kargo', 'posta', 'nakliyat'],
    'İletişim': ['turkcell', 'telekom', 'ttnet'],
    'Gıda & Market': ['gıda', 'market', 'migros', 'yemek'],
};

const determineCategory = (description: string): string => {
    if (!description) return 'Diğer';
    const lowerDesc = description.toLowerCase();
    for (const category in CATEGORY_KEYWORDS) {
        if (CATEGORY_KEYWORDS[category].some(keyword => lowerDesc.includes(keyword))) {
            return category;
        }
    }
    return 'Diğer';
};

export const useReportGenerator = (filters: ReportFilters) => {
    const { interviews, customers, offers, appointments } = useData();
    const { invoices } = useErp();
    const { users } = useAuth();
    const { t } = useLanguage();
    const { kmRecords, locationHistory } = usePersonnel();

    const generatedData = useMemo(() => {
        if (!filters.dateRange.start || !filters.dateRange.end) {
            return { columns: [], data: [], summary: {}, title: 'Rapor' };
        }

        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        switch (filters.reportType) {
            case 'sales_performance': {
                const filteredInvoices = invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    const userMatch = !filters.userId || inv.userId === filters.userId;
                    return invDate >= startDate && invDate <= endDate && userMatch;
                });

                const salesByUser = users.map(user => {
                    const userInvoices = filteredInvoices.filter(inv => inv.userId === user.id);
                    const totalSales = userInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
                    return {
                        userId: user.id,
                        userName: user.name,
                        invoiceCount: userInvoices.length,
                        totalSales: totalSales,
                    };
                }).filter(u => u.invoiceCount > 0);

                const totalRevenue = salesByUser.reduce((sum, u) => sum + u.totalSales, 0);

                return {
                    title: 'Personel Satış Performansı Raporu',
                    columns: [
                        { header: 'personnel', accessor: (row: any) => row.userName },
                        { header: 'invoiceCountReport', accessor: (row: any) => row.invoiceCount },
                        { header: 'totalSpending', accessor: (row: any) => row.totalSales.toLocaleString('tr-TR') },
                    ],
                    data: salesByUser.sort((a, b) => b.totalSales - a.totalSales),
                    summary: { 'Toplam Ciro': `${totalRevenue.toLocaleString('tr-TR')} TL` },
                    chartData: null
                };
            }
            case 'mileage_expense': {
                const filteredKmRecords = kmRecords.filter(rec => {
                    const recDate = new Date(rec.date);
                    const userMatch = !filters.userId || rec.userId === filters.userId;
                    return recDate >= startDate && recDate <= endDate && userMatch;
                });

                const recordsByDateAndUser: Record<string, KmRecord[]> = {};
                filteredKmRecords.forEach(rec => {
                    const key = `${rec.userId}_${rec.date}`;
                    if (!recordsByDateAndUser[key]) recordsByDateAndUser[key] = [];
                    recordsByDateAndUser[key].push(rec);
                });

                const reportData: any[] = [];
                Object.values(recordsByDateAndUser).forEach(dayRecords => {
                    const morning = dayRecords.find(r => r.type === 'morning');
                    const evening = dayRecords.find(r => r.type === 'evening');
                    if (morning && evening && evening.km > morning.km) {
                        const distance = evening.km - morning.km;
                        const reimbursement = distance * COMPANY_INFO.mileageRate;
                        const user = users.find(u => u.id === morning.userId);
                        reportData.push({
                            userName: user?.name || 'Bilinmeyen',
                            date: morning.date,
                            startKm: morning.km,
                            endKm: evening.km,
                            distance,
                            reimbursement,
                        });
                    }
                });

                const totalDistance = reportData.reduce((sum, row) => sum + row.distance, 0);
                const totalReimbursement = reportData.reduce((sum, row) => sum + row.reimbursement, 0);

                return {
                    title: t('report_mileage_title'),
                    columns: [
                        { header: 'date', accessor: (row: any) => new Date(row.date).toLocaleDateString() },
                        { header: 'personnel', accessor: (row: any) => row.userName },
                        { header: 'Başlangıç KM', accessor: (row: any) => row.startKm },
                        { header: 'Bitiş KM', accessor: (row: any) => row.endKm },
                        { header: 'Mesafe (km)', accessor: (row: any) => row.distance },
                        { header: 'Geri Ödeme', accessor: (row: any) => formatCurrency(row.reimbursement, 'TRY') },
                    ],
                    data: reportData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                    summary: { 'Toplam Mesafe': totalDistance, 'Toplam Geri Ödeme': totalReimbursement },
                    chartData: null,
                };
            }
            case 'punctuality': {
                const filteredLocations = locationHistory.filter(rec => {
                    const recDate = new Date(rec.timestamp);
                    const userMatch = !filters.userId || rec.userId === filters.userId;
                    return recDate >= startDate && recDate <= endDate && userMatch;
                });

                const recordsByDateAndUser: Record<string, LocationRecord[]> = {};
                filteredLocations.forEach(rec => {
                    const key = `${rec.userId}_${new Date(rec.timestamp).toISOString().slice(0, 10)}`;
                    if (!recordsByDateAndUser[key]) recordsByDateAndUser[key] = [];
                    recordsByDateAndUser[key].push(rec);
                });

                const reportData: any[] = [];
                Object.values(recordsByDateAndUser).forEach(dayRecords => {
                    if (dayRecords.length === 0) return;
                    
                    dayRecords.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    const firstSeen = new Date(dayRecords[0].timestamp);
                    const lastSeen = new Date(dayRecords[dayRecords.length - 1].timestamp);
                    const user = users.find(u => u.id === dayRecords[0].userId);
                    
                    const firstSeenStr = firstSeen.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    const lastSeenStr = lastSeen.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    
                    let status = "✔️ Zamanında";
                    if (firstSeenStr > COMPANY_INFO.workStartTime) status = "❗ Geç Başladı";
                    if (lastSeenStr < COMPANY_INFO.workEndTime) {
                        status = status === "✔️ Zamanında" ? "❗ Erken Çıktı" : "❗ Geç Başladı & Erken Çıktı";
                    }

                    reportData.push({
                        userName: user?.name || 'Bilinmeyen',
                        date: firstSeen.toISOString().slice(0, 10),
                        firstSeen: firstSeenStr,
                        lastSeen: lastSeenStr,
                        status: status,
                    });
                });

                return {
                    title: t('report_punctuality_title'),
                    columns: [
                        { header: 'date', accessor: (row: any) => new Date(row.date).toLocaleDateString() },
                        { header: 'personnel', accessor: (row: any) => row.userName },
                        { header: 'firstSeen', accessor: (row: any) => row.firstSeen },
                        { header: 'lastSeen', accessor: (row: any) => row.lastSeen },
                        { header: 'punctualityStatus', accessor: (row: any) => row.status },
                    ],
                    data: reportData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
                    summary: { 'Toplam Kayıt': reportData.length },
                    chartData: null,
                };
            }
            case 'customer_invoice_analysis': {
                // This logic remains unchanged
                const filteredInvoices = invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= startDate && invDate <= endDate;
                });

                const analysisByCustomer: Record<string, { total: number, count: number, categories: Record<string, number>, customerName: string }> = {};

                for (const invoice of filteredInvoices) {
                    if (!analysisByCustomer[invoice.customerId]) {
                        const customer = customers.find(c => c.id === invoice.customerId);
                        analysisByCustomer[invoice.customerId] = {
                            total: 0,
                            count: 0,
                            categories: {},
                            customerName: customer?.name || 'Bilinmeyen Müşteri'
                        };
                    }

                    const entry = analysisByCustomer[invoice.customerId];
                    entry.total += invoice.totalAmount;
                    entry.count++;
                    
                    const category = determineCategory(invoice.description || '');
                    entry.categories[category] = (entry.categories[category] || 0) + invoice.totalAmount;
                }
                
                const reportData = Object.entries(analysisByCustomer).map(([customerId, data]) => {
                    const topCategory = Object.entries(data.categories).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
                    return {
                        customerId,
                        customerName: data.customerName,
                        totalSpending: data.total,
                        invoiceCount: data.count,
                        avgInvoiceAmount: data.total / data.count,
                        topCategory
                    };
                });
                
                const totalCustomers = reportData.length;
                const totalRevenue = reportData.reduce((sum, d) => sum + d.totalSpending, 0);
                const avgSpendPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
                
                const monthlySpending: Record<string, number> = {};
                const categorySpending: Record<string, number> = {};

                filteredInvoices.forEach(inv => {
                    const month = new Date(inv.date).toISOString().slice(0, 7);
                    monthlySpending[month] = (monthlySpending[month] || 0) + inv.totalAmount;

                    const category = determineCategory(inv.description || '');
                    categorySpending[category] = (categorySpending[category] || 0) + inv.totalAmount;
                });
                
                const sortedMonths = Object.keys(monthlySpending).sort();
                const categoryArray = Object.entries(categorySpending).map(([name, value]) => ({ name, value }));

                return {
                    title: t('customer_invoice_analysis'),
                    columns: [
                        { header: 'customer', accessor: (row: any) => row.customerName },
                        { header: 'totalSpending', accessor: (row: any) => row.totalSpending.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                        { header: 'invoiceCountReport', accessor: (row: any) => row.invoiceCount },
                        { header: 'avgInvoiceAmount', accessor: (row: any) => row.avgInvoiceAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                        { header: 'topCategory', accessor: (row: any) => row.topCategory },
                    ],
                    data: reportData.sort((a, b) => b.totalSpending - a.totalSpending),
                    summary: {
                        'Toplam Ciro': `${totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`,
                        'totalCustomersInReport': totalCustomers,
                        'avgSpendPerCustomer': `${avgSpendPerCustomer.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`,
                    },
                    chartData: {
                        monthly: {
                            labels: sortedMonths,
                            data: sortedMonths.map(month => monthlySpending[month])
                        },
                        categories: categoryArray.sort((a, b) => b.value - a.value),
                        summary: {
                            totalCustomers,
                            avgSpendPerCustomer
                        }
                    }
                };
            }
            // Other report cases remain unchanged...
            default:
                return { columns: [], data: [], summary: {}, title: 'Rapor', chartData: null };
        }

    }, [filters, invoices, users, interviews, customers, offers, appointments, t, kmRecords, locationHistory]);

    return generatedData;
};