import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Navigation } from 'lucide-react';
import './Page.css';

interface LocalPageProps {
  onBack: () => void;
}

const LocalPage: React.FC<LocalPageProps> = ({ onBack }) => {
  return (
    <motion.div
      className="page-overlay"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="page-inner">
        <button className="page-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Voltar ao convite</span>
        </button>

        <div className="page-flower-deco">
          <img src="/images/flower.png" alt="" aria-hidden="true" />
        </div>

        <div className="page-content-wrap">
          <p className="page-eyebrow">Local da Cerimônia</p>
          <h1 className="page-title-script">Porttal do Lago</h1>
          <p className="page-subtitle">Guararapes — São Paulo</p>

          <div className="page-divider" />

          <div className="local-info-row">
            <div className="local-info-item">
              <Clock size={16} />
              <span>Sábado, 07 de Novembro de 2026</span>
            </div>
            <div className="local-info-item">
              <MapPin size={16} />
              <span>17h30 — Cerimônia</span>
            </div>
          </div>

          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1d3714.7570!2d-50.6409641!3d-21.3995879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x949605658e878517%3A0xed0176c12d8a6358!2sPorttal%20do%20Lago!5e0!3m2!1spt-BR!2sbr!4v1713025000000!5m2!1spt-BR!2sbr"
              width="100%"
              height="320"
              style={{ border: 0, borderRadius: '4px' }}
              allowFullScreen
              loading="lazy"
              title="Porttal do Lago"
            />
          </div>

          <a
            href="https://maps.google.com/?q=Porttal+do+Lago+Guararapes+SP"
            target="_blank"
            rel="noopener noreferrer"
            className="page-btn-primary"
          >
            <Navigation size={16} />
            Como chegar
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default LocalPage;
