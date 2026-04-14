import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, type Guest } from '../../services/api';
import './Page.css';

interface RSVPPageProps {
  onBack: () => void;
}

const RSVPPage: React.FC<RSVPPageProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'searching' | 'group' | 'loading' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Guest[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('searching');
    const found = await api.searchGuest(searchQuery);
    if (found) {
      const group = await api.getGroup(found.group);
      setSelectedGroup(group);
      setConfirmedIds(group.filter(g => g.confirmed).map(g => g.id));
      setStatus('group');
    } else {
      setStatus('idle');
      alert('Seu nome não foi encontrado na lista. Verifique a grafia ou entre em contato com os noivos.');
    }
  };

  const toggleMember = (id: string) => {
    setConfirmedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      await api.confirmRSVP(confirmedIds);
      setStatus('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3a4531', '#c5a059', '#fbf9f4'] });
    } catch {
      setStatus('group');
      alert('Erro ao confirmar. Tente novamente.');
    }
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
          <p className="page-eyebrow">Confirme sua Presença</p>
          <h1 className="page-title-script">Luan & Laís</h1>
          <p className="page-subtitle">07 de Novembro de 2026</p>

          <div className="page-divider" />

          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.form
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleSearch}
                className="rsvp-form"
              >
                <p className="rsvp-intro">Seu nome está na nossa lista de convidados exclusivos.</p>
                <input
                  type="text"
                  placeholder="Seu nome completo..."
                  className="input-custom"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  required
                />
                <button type="submit" className="page-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Verificar Convite
                </button>
              </motion.form>
            )}

            {status === 'searching' && (
              <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-state">
                <div className="spinner-floral" />
                <p>Buscando na lista...</p>
              </motion.div>
            )}

            {status === 'group' && (
              <motion.div key="group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group-selection">
                <p className="rsvp-intro">Selecione quem irá nos prestigiar:</p>
                <div className="members-grid">
                  {selectedGroup.map(guest => (
                    <motion.div
                      key={guest.id}
                      whileTap={{ scale: 0.97 }}
                      className={`member-card ${confirmedIds.includes(guest.id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(guest.id)}
                    >
                      <div className="member-check">
                        {confirmedIds.includes(guest.id) && <CheckCircle2 size={18} />}
                      </div>
                      <span>{guest.name}</span>
                    </motion.div>
                  ))}
                </div>
                <button onClick={handleConfirm} className="page-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
                  Confirmar Presença
                </button>
                <button onClick={() => setStatus('idle')} className="page-btn-ghost">
                  Não é você? Clique aqui
                </button>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-state">
                <div className="spinner-floral" />
                <p>Salvando com carinho...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="success-state"
              >
                <CheckCircle2 size={64} className="success-icon" />
                <h2>Tudo Pronto!</h2>
                <p>Mal podemos esperar para celebrar com você. ✨</p>
                <button onClick={() => setStatus('idle')} className="page-btn-ghost">
                  Confirmar outra pessoa
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default RSVPPage;
