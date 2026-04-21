import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ExternalLink, ArrowLeft } from 'lucide-react';
import { api, type Gift as GiftType } from '../services/api';
import './GiftsPublicPage.css';

const GiftsPublicPage: React.FC = () => {
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGifts().then(g => { setGifts(g); setLoading(false); });
  }, []);

  return (
    <div className="gp-wrap">
      <header className="gp-header">
        <Link to="/" state={{ skipEnvelope: true }} className="gp-back">
          <ArrowLeft size={18} /> Voltar ao Convite
        </Link>
        <div className="gp-header-content">
          <div className="gp-icon"><Gift size={24} /></div>
          <h1>Lista de Presentes</h1>
          <p>Luan & Laís · 07.11.2026</p>
        </div>
      </header>

      <main className="gp-content">
        {loading ? (
          <p className="gp-loading">Carregando presentes...</p>
        ) : gifts.length === 0 ? (
          <div className="gp-empty">
            <Gift size={40} strokeWidth={1} />
            <p>A lista de presentes ainda está sendo preparada.</p>
            <p className="gp-sub">Volte em breve!</p>
          </div>
        ) : (
          <div className="gp-grid">
            {gifts.map(g => (
              <div key={g.id} className="gp-card">
                {g.imageUrl ? (
                  <div className="gp-card-img">
                    <img src={g.imageUrl} alt={g.title} />
                  </div>
                ) : (
                  <div className="gp-card-img gp-card-placeholder">
                    <Gift size={32} strokeWidth={1} />
                  </div>
                )}
                <div className="gp-card-body">
                  <h3>{g.title}</h3>
                  {g.price > 0 && (
                    <p className="gp-price">
                      R$ {g.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  {g.buyUrl && (
                    <a href={g.buyUrl} target="_blank" rel="noopener noreferrer" className="gp-buy-btn">
                      <ExternalLink size={14} /> Comprar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="gp-footer">
        <p>Luan & Laís</p>
      </footer>
    </div>
  );
};

export default GiftsPublicPage;
