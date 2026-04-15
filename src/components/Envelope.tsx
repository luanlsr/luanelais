import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Gift, CheckCircle2, Navigation, Copy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, type Guest } from '../services/api';
import { Link } from 'react-router-dom';
import './Envelope.css';

type CoverStatus = 'closed' | 'opening' | 'open';

const Envelope: React.FC = () => {
  const [coverStatus, setCoverStatus] = useState<CoverStatus>('closed');

  // ── RSVP state ──
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'searching' | 'group' | 'loading' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Guest[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  // ── Pix copy ──
  const [pixCopied, setPixCopied] = useState(false);
  const PIX_KEY = api.getPixKey();

  const handleCoverClick = () => {
    if (coverStatus === 'closed') {
      setCoverStatus('opening');
      setTimeout(() => setCoverStatus('open'), 1000);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpStatus('searching');
    const found = await api.searchGuest(searchQuery);
    if (found) {
      const group = await api.getGroup(found.group);
      setSelectedGroup(group);
      setConfirmedIds(group.filter(g => g.confirmed).map(g => g.id));
      setRsvpStatus('group');
    } else {
      setRsvpStatus('idle');
      alert('Seu nome não foi encontrado. Verifique a grafia ou entre em contato com os noivos.');
    }
  };

  const toggleMember = (id: string) => {
    setConfirmedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setRsvpStatus('loading');
    try {
      await api.confirmRSVP(confirmedIds);
      setRsvpStatus('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2D3820', '#c5a059', '#fdfaf4'] });
    } catch {
      setRsvpStatus('group');
      alert('Erro ao confirmar. Tente novamente.');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const panelTransition = { duration: 0.9, ease: [0.76, 0, 0.24, 1] as const };

  return (
    <div className="env-wrapper">

      {/* ── The invitation content ── */}
      <div className="inv-layout">

        {/* Desktop sticky left panel */}
        <aside className="inv-left-panel">
          <div className="inv-left-names">
            <span className="env-name-script">Luan</span>
            <span className="env-amp-script">&</span>
            <span className="env-name-script">Laís</span>
          </div>
          <div className="env-divider" />
          <p className="inv-left-date">07 . 11 . 2026</p>
          <p className="inv-left-venue">Porttal do Lago</p>
          <p className="inv-left-city">Guararapes, SP</p>
        </aside>

        {/* Scrollable card */}
        <div className="inv-card-wrap">

          {/* Header olive */}
          <div className="inv-header-olive">
            <h1 className="inv-names-script">
              Luan <span className="inv-amp">&</span> Laís
            </h1>
          </div>

          {/* Couple photo */}
          <div className="inv-photo-wrap">
            <img src="/images/lualelais.jpeg" alt="Luan e Laís" className="inv-photo-img" />
            <div className="inv-photo-fade" />
          </div>

          {/* Quote */}
          <div className="inv-quote">
            <p>"Queremos te convidar para a comemoração do nosso casamento. Será uma honra ter você neste dia tão especial."</p>
          </div>

          {/* Date block */}
          <div className="inv-date-olive">
            <p className="inv-date-month">NOVEMBRO</p>
            <div className="inv-date-row">
              <div className="inv-date-side">
                <span>SÁBADO</span>
                <span>17h00</span>
              </div>
              <div className="inv-date-big">07</div>
              <div className="inv-date-side">
                <span>NOV</span>
                <span>2026</span>
              </div>
            </div>
            <p className="inv-date-venue">Porttal do Lago · Guararapes, SP</p>
          </div>

          {/* ── LOCAL DA CERIMÔNIA ── */}
          <section className="inv-section">
            <div className="inv-sec-header">
              <div className="inv-sec-icon"><MapPin size={20} /></div>
              <h2 className="inv-sec-title">Local da Cerimônia</h2>
            </div>
            <div className="inv-sec-body">
              <p className="inv-sec-name">Porttal do Lago</p>
              <p className="inv-sec-meta">Guararapes — São Paulo</p>
              <p className="inv-sec-meta" style={{ marginTop: '0.25rem' }}>Sábado · 07 de Novembro de 2026 · 17h00</p>
              <div className="inv-map">
                <iframe
                  src="https://maps.google.com/maps?q=Porttal+do+Lago,+Guararapes,+SP&hl=pt-BR&z=15&output=embed"
                  width="100%" height="260"
                  style={{ border: 0, borderRadius: '2px' }}
                  allowFullScreen loading="lazy" title="Porttal do Lago"
                />
              </div>
              <a href="https://maps.google.com/?q=Porttal+do+Lago+Guararapes+SP" target="_blank" rel="noopener noreferrer" className="inv-btn-outline">
                <Navigation size={14} /> Como chegar
              </a>
            </div>
          </section>

          {/* ── CONFIRMAR PRESENÇA ── */}
          <section className="inv-section inv-section-olive">
            <div className="inv-sec-header">
              <div className="inv-sec-icon inv-sec-icon-light"><Users size={20} /></div>
              <h2 className="inv-sec-title inv-sec-title-light">Confirmar Presença</h2>
            </div>
            <div className="inv-sec-body">
              <AnimatePresence mode="wait">
                {rsvpStatus === 'idle' && (
                  <motion.form key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSearch} className="inv-rsvp-form">
                    <p className="inv-rsvp-intro">Seu nome está na nossa lista de convidados.</p>
                    <input type="text" placeholder="Seu nome completo..." className="inv-rsvp-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} required />
                    <button type="submit" className="inv-btn-solid">Verificar Convite</button>
                  </motion.form>
                )}
                {rsvpStatus === 'searching' && (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inv-loading">
                    <div className="inv-spinner" /><p>Buscando na lista...</p>
                  </motion.div>
                )}
                {rsvpStatus === 'group' && (
                  <motion.div key="group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inv-group">
                    <p className="inv-rsvp-intro">Selecione quem irá nos prestigiar:</p>
                    <div className="inv-members">
                      {selectedGroup.map(guest => (
                        <motion.div key={guest.id} whileTap={{ scale: 0.97 }} className={`inv-member ${confirmedIds.includes(guest.id) ? 'selected' : ''}`} onClick={() => toggleMember(guest.id)}>
                          <div className="inv-member-check">{confirmedIds.includes(guest.id) && <CheckCircle2 size={16} />}</div>
                          <span>{guest.name}</span>
                        </motion.div>
                      ))}
                    </div>
                    <button onClick={handleConfirm} className="inv-btn-solid">Confirmar Presença</button>
                    <button onClick={() => setRsvpStatus('idle')} className="inv-btn-ghost">Não é você?</button>
                  </motion.div>
                )}
                {rsvpStatus === 'loading' && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inv-loading">
                    <div className="inv-spinner" /><p>Salvando com carinho...</p>
                  </motion.div>
                )}
                {rsvpStatus === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inv-success">
                    <CheckCircle2 size={52} /><h3>Tudo Pronto!</h3>
                    <p>Mal podemos esperar para celebrar com você.</p>
                    <button onClick={() => setRsvpStatus('idle')} className="inv-btn-ghost">Confirmar outra pessoa</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ── SUGESTÃO DE PRESENTE ── */}
          <section className="inv-section">
            <div className="inv-sec-header">
              <div className="inv-sec-icon"><Gift size={20} /></div>
              <h2 className="inv-sec-title">Sugestão de Presente</h2>
            </div>
            <div className="inv-sec-body">
              <p className="inv-rsvp-intro" style={{ color: '#6a6a60' }}>O melhor presente é a sua presença. Mas se desejar nos presentear:</p>
              <div className="inv-qr-frame">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=2D3820&bgcolor=fdfaf4&data=${encodeURIComponent(PIX_KEY)}`}
                  alt="QR Code Pix"
                  width={160}
                  height={160}
                  style={{ display: 'block' }}
                />
              </div>
              <div className="inv-pix-block">
                <span className="inv-pix-key">{PIX_KEY}</span>
                <button className="inv-pix-copy" onClick={handleCopyPix}>
                  <Copy size={13} />{pixCopied ? 'Copiado!' : 'Copiar chave Pix'}
                </button>
              </div>
              <Link to="/presentes" className="inv-btn-outline" style={{ marginTop: '1.2rem' }}>
                Ver Lista de Presentes <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <div className="inv-footer">
            <p className="inv-footer-script">Luan &amp; Laís</p>
            <p className="inv-footer-date">07 . 11 . 2026</p>
          </div>

        </div>{/* end inv-card-wrap */}
      </div>{/* end inv-layout */}


      {/* ══════════════════════════════════════════
          ENVELOPE COVER — 3 camadas:
          1. env-back       (fundo estático - verso do envelope)
          2. env-bottom-panel (corpo frontal - desliza pra baixo)
          3. env-top-panel    (aba em V com nomes - desliza pra cima)
          ══════════════════════════════════════════ */}
      <AnimatePresence>
        {coverStatus !== 'open' && (
          <div
            className="env-cover-wrapper"
            onClick={handleCoverClick}
            style={{ pointerEvents: coverStatus === 'opening' ? 'none' : 'all' }}
          >
            {/* Camada 2 — corpo frontal (desliza para baixo) */}
            <motion.div
              className="env-bottom-panel"
              animate={coverStatus === 'opening' ? { y: '100%' } : { y: 0 }}
              transition={panelTransition}
            >
              <div className="env-bottom-content">
                <div className="env-divider" />
                <p className="env-date-text">07 . 11 . 2026</p>
                <motion.p
                  className="env-hint"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Toque para abrir
                </motion.p>
              </div>
            </motion.div>

            {/* Camada 3 — aba do envelope em V (desliza para cima) */}
            <motion.div
              className="env-top-panel"
              animate={coverStatus === 'opening' ? { y: '-100%' } : { y: 0 }}
              transition={panelTransition}
            >
              <div className="env-top-content">
                <div className="env-names-block">
                  <span className="env-name-script">Luan</span>
                  <span className="env-amp-script">&</span>
                  <span className="env-name-script">Laís</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default Envelope;
