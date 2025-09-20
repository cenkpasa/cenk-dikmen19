import React from 'react';

const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>{title}</h2>
        <p>Bu modül yapım aşamasındadır ve yakında kullanıma sunulacaktır.</p>
    </div>
  );
};

export default PlaceholderPage;
