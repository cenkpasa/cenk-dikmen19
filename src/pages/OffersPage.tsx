import React from 'react';
import { useData } from '@/contexts/DataContext';

const OffersPage = () => {
  const { offers } = useData();

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Teklifler</h3>
        <button className="btn" style={{width: 'auto'}}>Yeni Teklif Oluştur</button>
      </div>
      <div className="table-container">
        <table className="data-table">
            <thead>
                <tr>
                    <th>Teklif No</th>
                    <th>Müşteri</th>
                    <th>Tarih</th>
                    <th>Tutar</th>
                </tr>
            </thead>
            <tbody>
                {offers.map(offer => (
                    <tr key={offer.id}>
                        <td>{offer.offerNo}</td>
                        <td>{offer.customerName}</td>
                        <td>{new Date(offer.date).toLocaleDateString('tr-TR')}</td>
                        <td>{offer.totalAmount.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default OffersPage;
