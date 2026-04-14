import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import type { Guest } from '../../services/api';

interface RSVPSectionProps {
  rsvpStatus: 'idle' | 'searching' | 'group' | 'loading' | 'success';
  setRsvpStatus: (s: 'idle' | 'searching' | 'group' | 'loading' | 'success') => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  selectedGroup: Guest[];
  confirmedIds: string[];
  handleSearch: (e: React.FormEvent) => void;
  toggleMember: (id: string) => void;
  handleConfirmFinal: () => void;
}

const RSVPSection: React.FC<RSVPSectionProps> = ({
  rsvpStatus,
  setRsvpStatus,
  searchQuery,
  setSearchQuery,
  selectedGroup,
  confirmedIds,
  handleSearch,
  toggleMember,
  handleConfirmFinal
}) => {
  return (
    <section id="rsvp" className="rsvp-section reveal">
      <div className="container">
        <div className="rsvp-card-outer">
          <h2 className="section-title">Confirme sua Presença</h2>
          
          <div className="rsvp-tabs-content">
            {rsvpStatus === 'searching' && (
              <div className="loading-stage">
                <div className="spinner-floral" />
                <p>Buscando na lista...</p>
              </div>
            )}

            {rsvpStatus === 'idle' && (
              <form onSubmit={handleSearch} className="form-animated">
                <p className="form-intro">Seu nome está na nossa lista de convidados exclusivos.</p>
                <input 
                  type="text" 
                  placeholder="Seu nome completo..." 
                  className="input-custom"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required 
                />
                <button type="submit" className="btn-primary-full">Verificar Convite</button>
              </form>
            )}

            {rsvpStatus === 'group' && (
              <div className="selection-flow">
                <p className="selection-title">Selecione quem irá nos prestigiar:</p>
                <div className="members-grid">
                  {selectedGroup.map(guest => (
                    <motion.div 
                      key={guest.id} 
                      whileTap={{ scale: 0.98 }}
                      className={`member-card ${confirmedIds.includes(guest.id) ? 'selected' : ''}`}
                      onClick={() => toggleMember(guest.id)}
                    >
                      <div className="indicator">
                        {confirmedIds.includes(guest.id) && <CheckCircle2 size={18} />}
                      </div>
                      <span className="name-text">{guest.name}</span>
                    </motion.div>
                  ))}
                </div>
                <button onClick={handleConfirmFinal} className="btn-primary-full mt-2">Confirmar Presença</button>
                <button onClick={() => setRsvpStatus('idle')} className="btn-text">Não é você? Clique aqui</button>
              </div>
            )}

            {rsvpStatus === 'loading' && (
              <div className="loading-stage">
                <div className="spinner-floral" />
                <p>Salvando com carinho...</p>
              </div>
            )}

            {rsvpStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="success-stage"
              >
                <CheckCircle2 size={60} className="success-icon" />
                <h3>Tudo Pronto!</h3>
                <p>Mal podemos esperar para celebrar com você.</p>
                <button onClick={() => setRsvpStatus('idle')} className="btn-outline-small">Confirmar outra pessoa</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RSVPSection;
