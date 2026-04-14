import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Gift } from 'lucide-react';
import './Envelope.css';

type Page = 'local' | 'rsvp' | 'gifts';

interface EnvelopeProps {
  onNavigate: (page: Page) => void;
}

const Envelope: React.FC<EnvelopeProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="envelope-wrapper">
      <motion.div
        className="envelope-container-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className={`envelope-gate ${isOpen ? 'open' : ''}`}>
          {/* Vertical Doors */}
          <div className="door door-left">
            <div className="door-texture"></div>
          </div>
          <div className="door door-right">
            <div className="door-texture"></div>
          </div>

          <div className="invitation-card-full">
            <div className="invitation-bg-flower">
              <img src="/images/flower.png" alt="Wedding Flower" />
            </div>

            <div className="invitation-header">
              <p className="serif-muted">COM A BÊNÇÃO DE DEUS E DE NOSSOS PAIS</p>
              <div className="parents-names">
                <div className="parent-pair">
                  <span>MARIO ALVES MARTINS</span>
                  <span>FILOMENA GOMES MOREIRA MARTINS</span>
                </div>
                <div className="parent-pair">
                  <span>APARECIDO GILBERTO MADEIRA</span>
                  <span>VERA APARECIDA FREDIANI MADEIRA</span>
                </div>
              </div>
            </div>

            <div className="invitation-names">
              <h1 className="invitation-couple-names">
                Luan
                <span className="amp-gold">&</span>
                Laís
              </h1>
            </div>

            <div className="invitation-message">
              <p className="serif">QUEREMOS TE CONVIDAR PARA A COMEMORAÇÃO DO NOSSO CASAMENTO</p>
            </div>

            <div className="invitation-date-info">
              <div className="date-col">
                <span className="label">SÁBADO</span>
                <span className="value">17H30</span>
              </div>
              <div className="date-center">07</div>
              <div className="date-col">
                <span className="label">NOV</span>
                <span className="value">2026</span>
              </div>
            </div>

            <div className="invitation-actions">
              <button className="action-item" onClick={() => onNavigate('local')}>
                <div className="action-circle"><MapPin size={24} /></div>
                <span>LOCAL DA CERIMÔNIA</span>
              </button>
              <button className="action-item" onClick={() => onNavigate('rsvp')}>
                <div className="action-circle"><Users size={24} /></div>
                <span>CONFIRMAR PRESENÇA</span>
              </button>
              <button className="action-item" onClick={() => onNavigate('gifts')}>
                <div className="action-circle"><Gift size={24} /></div>
                <span>SUGESTÃO DE PRESENTE</span>
              </button>
            </div>

            <p className="click-hint-bottom">CLIQUE NOS BOTÕES ACIMA</p>
          </div>

          <AnimatePresence>
            {!isOpen && (
              <motion.div
                className="seal-trigger"
                onClick={handleOpen}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ x: '-50%', y: '-50%' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="wax-seal-olive">
                  <img src="/images/selo.png" alt="Selo de Lacre" className="seal-image-asset" />
                </div>
                <motion.span
                  className="seal-text-script"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Clique no selo para abrir
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Envelope;
