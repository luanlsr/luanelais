import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Gift, CheckCircle2, Navigation, Copy, ArrowRight, Trash2, Plus, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { generatePixPayload, maskPhone } from '../utils/pix';
import { useLocation, useNavigate } from 'react-router-dom';
import GiftsModal from './GiftsModal';
import './Envelope.css';

type CoverStatus = 'closed' | 'opening' | 'open';

const Envelope: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shouldSkipEnvelope = location.state?.skipEnvelope === true;
  const [coverStatus, setCoverStatus] = useState<CoverStatus>('closed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (shouldSkipEnvelope) {
      setCoverStatus('open');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [shouldSkipEnvelope, navigate, location.pathname]);

  // ── RSVP state ──
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'form' | 'loading' | 'success'>('idle');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);

  // ── Pix data ──
  const [pixData, setPixData] = useState({ key: '', type: 'email', holder: '' });
  const [pixCopied, setPixCopied] = useState(false);

  const photos = [
    '/images/lualelais.jpeg',
    '/images/lualelais2.jpeg',
    '/images/lualelais3.jpeg',
    '/images/lualelais4.jpeg',
    '/images/lualelais5.jpeg',
    '/images/lualelais6.jpeg',
    '/images/lualelais7.jpeg',
  ];

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.history.replaceState(null, '', '/');
    setActiveSection('');

    const div = scrollRef.current;
    if (!div) return;

    const handleScroll = () => {
      setScrolled(div.scrollTop > 50);
    };

    const observerOptions = {
      root: div,
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const sections = ['cerimonia', 'rsvp', 'presentes'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const loadData = async () => {
      const pix = await api.getPixData();
      setPixData(pix);
    };
    loadData();

    div.addEventListener('scroll', handleScroll);
    return () => {
      div.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleCoverClick = () => {
    if (coverStatus === 'closed') {
      // Tenta iniciar a música imediatamente após o clique (obrigatório para iOS/Safari)
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Erro ao tocar áudio:", err));
      }

      setCoverStatus('opening');
      setTimeout(() => {
        setCoverStatus('open');
      }, 1000);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const addChild = () => setChildren([...children, { name: '', age: '' }]);
  const removeChild = (index: number) => setChildren(children.filter((_, i) => i !== index));
  const updateChild = (index: number, field: 'name' | 'age', value: string) => {
    const newChildren = [...children];
    (newChildren[index] as any)[field] = value;
    setChildren(newChildren);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpStatus('loading');

    try {
      await api.submitRSVP({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        children: children
      });

      setRsvpStatus('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D3820', '#c5a059', '#fdfaf4']
      });

    } catch {
      setRsvpStatus('form');
      alert('Erro ao confirmar. Tente novamente.');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixData.key);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const panelTransition = { duration: 0.9, ease: [0.76, 0, 0.24, 1] as const };

  return (
    <div className="env-wrapper">
      <div className="inv-card-wrap" ref={scrollRef}>
        {coverStatus === 'open' && (
          <header className={`inv-nav-main ${scrolled ? 'scrolled' : ''}`}>
            <div className="inv-nav-content">
              <div
                className="inv-nav-logo"
                onClick={() => {
                  scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  window.history.pushState(null, '', '/');
                  setActiveSection('');
                }}
                style={{ cursor: 'pointer' }}
              >
                L & L
              </div>
              <nav className="inv-nav-links">
                <a href="#cerimonia" className={activeSection === 'cerimonia' ? 'active' : ''}>Cerimônia</a>
                <a href="#rsvp" className={activeSection === 'rsvp' ? 'active' : ''}>Confirmar</a>
                <a href="#presentes" className={activeSection === 'presentes' ? 'active' : ''}>Presentes</a>
              </nav>
            </div>
          </header>
        )}

        <div className="inv-card-inner-max">
          <section className="inv-hero-split">
            <div className="hero-photo-side">
              <div className="hero-mosaic-container">
                <motion.div
                  className="hero-mosaic-track"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    duration: 250,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {[...photos, ...photos].map((img, idx) => (
                    <img key={idx} src={img} alt="Snapshot" className="mosaic-img" />
                  ))}
                </motion.div>
              </div>
              <div className="hero-photo-gradient" />
            </div>

            <div className="hero-text-side">
              <div className="hero-content-wrap">
                <span className="hero-sup">SAVE THE DATE</span>
                <h1 className="hero-names">
                  Luan <br /> <span>&</span> Laís
                </h1>

                <div className="hero-date-portal">
                  <div className="h-date-top">
                    <span>NOV</span>
                    <span className="h-sep">|</span>
                    <span className="h-day-gold">07</span>
                    <span className="h-sep">|</span>
                    <span>2026</span>
                  </div>
                  <p className="h-date-sub">SÁBADO ÀS 17:00H</p>
                </div>

                <a href="#rsvp" className="hero-cta">Confirmar Presença</a>
              </div>
            </div>
          </section>

          <div className="inv-quote">
            <div className="quote-art" />
            <p>
              "Queremos te convidar para a comemoração do nosso casamento.
              Será uma honra ter você neste dia tão especial."
            </p>
          </div>

          <div className="inv-sections-vertical">
            <section id="cerimonia" className="inv-section-full">
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

            <section id="rsvp" className="inv-section-full inv-section-olive">
              <div className="inv-sec-header">
                <div className="inv-sec-icon inv-sec-icon-light"><Users size={20} /></div>
                <h2 className="inv-sec-title inv-sec-title-light">Confirmar Presença</h2>
              </div>
              <div className="inv-sec-body">
                <AnimatePresence mode="wait">
                  {rsvpStatus === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inv-rsvp-idle">
                      <p className="inv-rsvp-intro">Confirme sua presença no nosso grande dia preenchendo o formulário abaixo.</p>
                      <button onClick={() => setRsvpStatus('form')} className="inv-btn-solid">Confirmar Presença</button>
                    </motion.div>
                  )}
                  {rsvpStatus === 'form' && (
                    <motion.form key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={handleConfirm} className="inv-rsvp-form">
                      <div className="rsvp-field-group">
                        <label>Nome Completo</label>
                        <input
                          type="text"
                          placeholder="Seu nome aqui..."
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="rsvp-field-row">
                        <div className="rsvp-field-group">
                          <label>WhatsApp / Telefone</label>
                          <input
                            type="tel"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="rsvp-field-group">
                          <label>E-mail</label>
                          <input
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="rsvp-children-section">
                        <div className="rsvp-children-header">
                          <label>Filhos Pequenos?</label>
                          <button type="button" onClick={addChild} className="btn-add-child">
                            <Plus size={14} /> Adicionar Filho
                          </button>
                        </div>

                        {children.map((child, idx) => (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="rsvp-child-row">
                            <input
                              placeholder="Nome do filho"
                              value={child.name}
                              onChange={e => updateChild(idx, 'name', e.target.value)}
                              required
                            />
                            <input
                              placeholder="Idade"
                              type="number"
                              style={{ width: '80px' }}
                              value={child.age}
                              onChange={e => updateChild(idx, 'age', e.target.value)}
                              required
                            />
                            <button type="button" onClick={() => removeChild(idx)} className="btn-remove-child">
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      <div className="rsvp-actions">
                        <button type="submit" className="inv-btn-solid">Salvar Confirmação</button>
                        <button type="button" onClick={() => setRsvpStatus('idle')} className="inv-btn-ghost">Cancelar</button>
                      </div>
                    </motion.form>
                  )}
                  {rsvpStatus === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inv-loading">
                      <div className="inv-spinner" /><p>Salvando com carinho...</p>
                    </motion.div>
                  )}
                  {rsvpStatus === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inv-success">
                      <CheckCircle2 size={52} /><h3>Confirmado com Sucesso!</h3>
                      <p>Mal podemos esperar para celebrar com você.</p>
                      <button onClick={() => {
                        setRsvpStatus('idle');
                        setFormData({ fullName: '', phone: '', email: '' });
                        setChildren([]);
                      }} className="inv-btn-ghost">Confirmar outra pessoa</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            <section id="presentes" className="inv-section-full">
              <div className="inv-sec-header">
                <div className="inv-sec-icon"><Gift size={20} /></div>
                <h2 className="inv-sec-title">Sugestão de Presente</h2>
              </div>
              <div className="inv-sec-body">
                <p className="inv-rsvp-intro" style={{ color: '#6a6a60' }}>Se desejar nos presentear:</p>
                <div className="inv-gift-actions-top" style={{ marginBottom: '2.5rem', width: '100%' }}>
                  <button onClick={() => setIsGiftsModalOpen(true)} className="inv-btn-solid-olive" style={{ cursor: 'pointer', border: 'none', width: '100%' }}>
                    Ver Lista de Presentes <ArrowRight size={20} />
                  </button>
                </div>

                <p className="inv-rsvp-intro" style={{ marginTop: '2rem', color: '#8b8b80', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Ou se preferir nos presentear com uma contribuição livre:
                </p>
                
                <button 
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="inv-btn-outline" 
                  style={{ fontSize: '0.75rem', padding: '0.8rem 2rem' }}
                >
                  {showQRCode ? 'Ocultar Chave Pix' : 'Clique para ver a Chave Pix'}
                </button>

                <AnimatePresence>
                  {showQRCode && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      style={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <div className="inv-qr-frame" style={{ background: '#fff', padding: '15px', borderRadius: '4px', marginTop: '2rem' }}>
                        {pixData.key && (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatePixPayload(pixData.key))}&ecc=M`}
                            alt="QR Code Pix"
                            width={130}
                            height={130}
                            style={{ display: 'block' }}
                          />
                        )}
                      </div>
                      <div className="inv-pix-details-wrap">
                        <p className="inv-pix-type-label">
                          Chave {
                            pixData.type === 'cell' ? 'Celular' :
                              pixData.type === 'cpf' ? 'CPF' :
                                pixData.type === 'email' ? 'E-mail' :
                                  pixData.type === 'cnpj' ? 'CNPJ' : 'Aleatória'
                          }
                        </p>
                        <div className="inv-pix-block">
                          <span className="inv-pix-key">{pixData.key}</span>
                          <button className="inv-pix-copy" onClick={handleCopyPix}>
                            <Copy size={13} /> {pixCopied ? 'Copiado!' : 'Copiar chave Pix'}
                          </button>
                        </div>
                        {pixData.holder && (
                          <p className="inv-pix-beneficiary">Titular: <strong>{pixData.holder}</strong></p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          <footer className="inv-footer-portal" style={{ background: '#2D3820', padding: '6rem 2rem', textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.9 }}>Luan & Laís</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.7rem', letterSpacing: '4px', opacity: 0.5, textTransform: 'uppercase' }}>07 de Novembro de 2026</p>
          </footer>
        </div>
      </div>

      <AnimatePresence>
        {coverStatus !== 'open' && (
          <div
            className="env-cover-wrapper"
            onClick={handleCoverClick}
            style={{
              pointerEvents: coverStatus === 'opening' ? 'none' : 'all'
            }}
          >
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

            {/* Selo movido para fora para evitar clipping e ficar por cima de tudo */}
            <motion.div 
              className="env-seal-wrap"
              initial={{ x: '-50%', y: '-50%', opacity: 1 }}
              animate={coverStatus === 'opening' ? { x: '-50%', y: '-100vh', opacity: 0 } : { x: '-50%', y: '-50%', opacity: 1 }}
              transition={panelTransition}
            >
              <img src="/images/selo.png" alt="Lacre" className="env-seal-img" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── AUDIO SYSTEM (DISCREET) ── */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/musicas/musica.mp3" type="audio/mpeg" />
      </audio>

      {coverStatus === 'open' && (
        <motion.button 
          className="inv-audio-control"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleAudio}
          title="Gerenciar Música"
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </motion.button>
      )}

      <GiftsModal isOpen={isGiftsModalOpen} onClose={() => setIsGiftsModalOpen(false)} />
    </div>
  );
};

export default Envelope;