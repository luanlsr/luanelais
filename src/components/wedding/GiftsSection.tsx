import React from 'react';
import { Gift } from 'lucide-react';

const GiftsSection: React.FC = () => {
  return (
    <section id="presentes" className="gifts-section reveal">
      <div className="gift-icon-box" style={{ marginBottom: '2rem', color: 'var(--primary-olive)' }}>
        <Gift size={48} strokeWidth={1} />
      </div>
      <h2 className="section-title">Sugestão de Presente</h2>
      <p className="serif" style={{ maxWidth: '600px', margin: '0 auto 3rem', opacity: 0.8 }}>
        O melhor presente é sua presença, mas se desejar ter um detalhe conosco, deixamos esta opção para sua maior comodidade.
      </p>
      
      <div className="qr-container-premium">
        <div className="qr-box">
          <div className="qr-mock">
            <div className="qr-inner-logo">L&L</div>
          </div>
        </div>
        <p className="pix-label" style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.7 }}>
          chavepix@casamentoluanelais.com
        </p>
      </div>
    </section>
  );
};

export default GiftsSection;
