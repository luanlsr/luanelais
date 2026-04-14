import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy } from 'lucide-react';
import './Page.css';

interface GiftsPageProps {
  onBack: () => void;
}

const PIX_KEY = 'chavepix@casamentoluanelais.com';

const GiftsPage: React.FC<GiftsPageProps> = ({ onBack }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <p className="page-eyebrow">Sugestão de Presente</p>
          <h1 className="page-title-script">Com Carinho</h1>

          <div className="page-divider" />

          <p className="gifts-message">
            O melhor presente é a sua presença. Mas se desejar nos presentear, deixamos esta opção para sua comodidade.
          </p>

          <div className="qr-block">
            <div className="qr-frame">
              <div className="qr-logo-mock">L&amp;L</div>
            </div>
            <p className="qr-label">Pix</p>
          </div>

          <div className="pix-key-block">
            <span className="pix-key-text">{PIX_KEY}</span>
            <button className="pix-copy-btn" onClick={handleCopy}>
              <Copy size={15} />
              {copied ? 'Copiado!' : 'Copiar chave'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GiftsPage;
