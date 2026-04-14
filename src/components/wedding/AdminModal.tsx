import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import type { Guest } from '../../services/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  stats: { total: number; confirmed: number; pending: number };
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, guests, stats }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="admin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="admin-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="admin-header">
              <div className="handle" />
              <div className="title-row">
                <h2>Painel de Gestão</h2>
                <button onClick={onClose} className="close-btn"><X /></button>
              </div>
            </div>

            <div className="admin-body">
              <div className="stats-dashboard">
                <div className="stat-box">
                  <label>Convidados Totais</label>
                  <strong>{stats.total}</strong>
                </div>
                <div className="stat-box">
                  <label>Confirmados</label>
                  <strong>{stats.confirmed}</strong>
                </div>
                <div className="stat-box">
                  <label>Pendentes</label>
                  <strong>{stats.pending}</strong>
                </div>
              </div>

              <div className="guests-scroll-area">
                {guests.length === 0 ? (
                  <div className="empty-state">Carregando lista...</div>
                ) : (
                  guests.map(guest => (
                    <div key={guest.id} className={`guest-row-card ${guest.confirmed ? 'confirmed' : 'pending'}`}>
                      <div className="guest-data">
                        <span className="guest-names">{guest.name}</span>
                        <span className="guest-meta">{guest.group}</span>
                      </div>
                      <div className={`status-badge ${guest.confirmed ? 'confirmed' : 'pending'}`}>
                        {guest.confirmed ? 'Confirmado' : 'Pendente'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
