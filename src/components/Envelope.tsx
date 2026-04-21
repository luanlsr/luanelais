import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Gift, CheckCircle2, Navigation, Copy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, type Guest } from '../services/api';
import { generatePixPayload } from '../utils/pix';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Envelope.css';

type CoverStatus = 'closed' | 'opening' | 'open';

const Envelope: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const shouldSkipEnvelope = location.state?.skipEnvelope === true;

  const [coverStatus, setCoverStatus] = useState<CoverStatus>('closed');

  // ✅ controla abertura via efeito (mais seguro)
  useEffect(() => {
    if (shouldSkipEnvelope) {
      setCoverStatus('open');

      // limpa o state para não "grudar"
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [shouldSkipEnvelope, navigate, location.pathname]);

  // ── RSVP state ──
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'searching' | 'group' | 'loading' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Guest[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  // ── Pix copy ──
  const [pixCopied, setPixCopied] = useState(false);
  const PIX_KEY = api.getPixKey();

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
    // Reset de rota para '/' ao carregar/atualizar a página
    window.history.replaceState(null, '', '/');
    setActiveSection('');
    
    const div = scrollRef.current;
    if (!div) return;

    const handleScroll = () => {
      setScrolled(div.scrollTop > 50);
    };

    // Sensor de Seção Ativa (Scroll Spy)
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

    div.addEventListener('scroll', handleScroll);
    return () => {
      div.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);


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
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    setRsvpStatus('loading');

    try {
      await api.confirmRSVP(confirmedIds);

      setRsvpStatus('success');

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D3820', '#c5a059', '#fdfaf4']
      });

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

      {/* ── Conteúdo do convite ── */}
      <div className="inv-card-wrap" ref={scrollRef}>

        {/* ── HEADER COM NAVEGAÇÃO (Apenas quando aberto) ── */}
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
            
            {/* ── HERO SECTION IMERSIVO (WEB & MOBILE) ── */}
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

          {/* ── FRASE ── */}
          <div className="inv-quote">
            <div className="quote-art" />
            <p>
              "Queremos te convidar para a comemoração do nosso casamento.
              Será uma honra ter você neste dia tão especial."
            </p>
          </div>

          <div className="inv-sections-vertical">
            {/* ── LOCAL DA CERIMÔNIA ── */}
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

            {/* ── CONFIRMAR PRESENÇA ── */}
            <section id="rsvp" className="inv-section-full inv-section-olive">
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
            <section id="presentes" className="inv-section-full">
              <div className="inv-sec-header">
                <div className="inv-sec-icon"><Gift size={20} /></div>
                <h2 className="inv-sec-title">Sugestão de Presente</h2>
              </div>
              <div className="inv-sec-body">
                <p className="inv-rsvp-intro" style={{ color: '#6a6a60' }}>Se desejar nos presentear:</p>
                <div className="inv-qr-frame" style={{ background: '#fff', padding: '15px', borderRadius: '4px' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatePixPayload(PIX_KEY))}&ecc=M`}
                    alt="QR Code Pix"
                    width={160}
                    height={160}
                    style={{ display: 'block' }}
                  />
                </div>
                <div className="inv-pix-block">
                  <span className="inv-pix-key">{PIX_KEY}</span>
                  <button className="inv-pix-copy" onClick={handleCopyPix}>
                    <Copy size={13} /> {pixCopied ? 'Copiado!' : 'Copiar chave Pix'}
                  </button>
                </div>
                <Link to="/presentes" className="inv-btn-outline" style={{ marginTop: '1.2rem' }}>
                  Ver Lista de Presentes <ArrowRight size={14} />
                </Link>
              </div>
            </section>
          </div>

          <footer className="inv-footer-portal" style={{ background: '#2D3820', padding: '6rem 2rem', textAlign: 'center', color: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.9 }}>Luan & Laís</h2>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '0.7rem', letterSpacing: '4px', opacity: 0.5, textTransform: 'uppercase' }}>07 de Novembro de 2026</p>
          </footer>

        </div>
      </div>

      {/* ── ENVELOPE ── */}
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
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Envelope;