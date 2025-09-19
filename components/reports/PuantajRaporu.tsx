import React, { useEffect, useState } from 'react';
import { fetchLocationPings, edgesByDay } from '@/services/attendanceService';
import { DayEdge } from '@/types';
import { COMPANY_INFO } from '@/constants';

function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}
function minutesOf(ts: string) {
    const d = new Date(ts);
    return d.getHours() * 60 + d.getMinutes();
}

export default function PuantajRaporu({ start, end }: { start: string; end: string }) {
    const [rows, setRows] = useState<(DayEdge & { status: string })[]>([]);

    useEffect(() => {
        fetchLocationPings(start, end).then(p => {
            const edges = edgesByDay(p);
            const ws = toMinutes(COMPANY_INFO.workStartTime);
            const we = toMinutes(COMPANY_INFO.workEndTime);
            const tolerance = COMPANY_INFO.workToleranceMin;

            const withStatus = edges.map(e => {
                const f = minutesOf(e.first);
                const l = minutesOf(e.last);
                const late = f > ws + tolerance;
                const early = l < we - tolerance;
                const status = late && early ? 'Geç Başladı & Erken Çıktı' : late ? 'Geç Başladı' : early ? 'Erken Çıktı' : 'Uygun';
                return { ...e, status };
            });
            setRows(withStatus);
        }).catch(() => setRows([]));
    }, [start, end]);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Puantaj Raporu ({new Date(start).toLocaleDateString()} - {new Date(end).toLocaleDateString()})</h2>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left font-semibold border-b">
                        <th className="p-2">Kullanıcı</th>
                        <th className="p-2">Tarih</th>
                        <th className="p-2">İlk Sinyal</th>
                        <th className="p-2">Son Sinyal</th>
                        <th className="p-2">Durum</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className={`border-b ${r.status !== 'Uygun' ? 'text-red-600' : ''}`}>
                            <td className="p-2">{r.userId}</td>
                            <td className="p-2">{r.date}</td>
                            <td className="p-2">{new Date(r.first).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="p-2">{new Date(r.last).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="p-2">{r.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
