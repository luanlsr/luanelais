import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ArrowLeft, Heart, ShoppingBag, Search, SlidersHorizontal, X, Star, Check, MapPin, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Gift as GiftType } from '../services/api';
import './GiftsPublicPage.css';

const ITEMS_PER_PAGE = 12;

const GiftsPublicPage: React.FC = () => {
  const [allGifts, setAllGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | '200-500' | 'over500'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'low-high' | 'high-low'>('latest');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [buyingGift, setBuyingGift] = useState<GiftType | null>(null);
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const DELIVERY_DATA = {
    recipient: "Laís de Souza Santos",
    line1: "Rua das Oliveiras, 711 — Apto 22",
    line2: "Av. Antônio Trajano, 1405 - Centro",
    city: "Três Lagoas - MS",
    zip: "79601-001"
  };

  const DELIVERY_ADDRESS_STR = `${DELIVERY_DATA.recipient} - ${DELIVERY_DATA.line1} - ${DELIVERY_DATA.line2}, ${DELIVERY_DATA.city} - CEP: ${DELIVERY_DATA.zip}`;

  // Lógica de Filtragem e Ordenação (Movido para cima para ser usado no observer)
  const filteredGifts = useMemo(() => {
    let result = [...allGifts];

    if (searchTerm) {
      result = result.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'Todas') {
      result = result.filter(g => g.category === categoryFilter);
    }

    if (brandFilter !== 'Todas') {
      result = result.filter(g => g.brand === brandFilter);
    }

    if (priceFilter !== 'all') {
      if (priceFilter === 'under200') result = result.filter(g => g.price <= 200);
      else if (priceFilter === '200-500') result = result.filter(g => g.price > 200 && g.price <= 500);
      else if (priceFilter === 'over500') result = result.filter(g => g.price > 500);
    }

    if (sortOrder === 'low-high') result.sort((a, b) => a.price - b.price);
    else if (sortOrder === 'high-low') result.sort((a, b) => b.price - a.price);

    return result;
  }, [allGifts, searchTerm, categoryFilter, brandFilter, priceFilter, sortOrder]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < filteredGifts.length) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, visibleCount, filteredGifts.length]);

  useEffect(() => {
    api.getGifts().then(g => {
      setAllGifts(g);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => ['Todas', ...new Set(allGifts.map(g => g.category))].sort(), [allGifts]);
  const brands = useMemo(() => ['Todas', ...new Set(allGifts.map(g => g.brand).filter(Boolean) as string[])].sort(), [allGifts]);

  const visibleGifts = filteredGifts.slice(0, visibleCount);

  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const parts = formatted.split(',');
    return { main: parts[0], cents: parts[1] };
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingGift || !guestName.trim()) return;

    setSubmitting(true);
    try {
      await api.markGiftAsBought(buyingGift.id, guestName.trim());
      // Abre o link do presente em nova aba se houver
      if (buyingGift.buyUrl) {
        window.open(buyingGift.buyUrl, '_blank');
      }
      // Atualiza estado local
      setAllGifts(prev => prev.map(g => g.id === buyingGift.id ? { ...g, isBought: true, boughtBy: guestName.trim() } : g));
      setBuyingGift(null);
      setGuestName('');
    } catch (err) {
      alert('Erro ao marcar presente. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(DELIVERY_ADDRESS_STR);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const Sidebar = () => (
    <aside className="gp-sidebar">
      <div className="gp-sidebar-section">
        <h3>Categorias</h3>
        <ul className="gp-sidebar-list">
          {categories.map(cat => (
            <li key={cat} className={categoryFilter === cat ? 'active' : ''} onClick={() => setCategoryFilter(cat)}>
              {cat}
            </li>
          ))}
        </ul>
      </div>

      <div className="gp-sidebar-section">
        <h3>Marcas</h3>
        <ul className="gp-sidebar-list">
          {brands.map(b => (
            <li key={b} className={brandFilter === b ? 'active' : ''} onClick={() => setBrandFilter(b)}>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="gp-sidebar-section">
        <h3>Preço</h3>
        <ul className="gp-sidebar-list">
          <li className={priceFilter === 'all' ? 'active' : ''} onClick={() => setPriceFilter('all')}>Todos</li>
          <li className={priceFilter === 'under200' ? 'active' : ''} onClick={() => setPriceFilter('under200')}>Até R$ 200</li>
          <li className={priceFilter === '200-500' ? 'active' : ''} onClick={() => setPriceFilter('200-500')}>R$ 200 - R$ 500</li>
          <li className={priceFilter === 'over500' ? 'active' : ''} onClick={() => setPriceFilter('over500')}>Acima de R$ 500</li>
        </ul>
      </div>
    </aside>
  );

  return (
    <div className="gp-wrap">
      <header className="gp-header">
        <Link to="/" state={{ skipEnvelope: true }} className="gp-back">
          <ArrowLeft size={18} /> Voltar ao Convite
        </Link>
        <div className="gp-header-content">
          <h1>Lista de Presentes</h1>
          <p>Luan & Laís · 07.11.2026</p>
        </div>

        <div className="gp-tools">
          <div className="gp-search-row">
            <div className="gp-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Busque por marca, produto..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              />
            </div>
            <div className="gp-mobile-actions-row">
              <button className="gp-mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
                <SlidersHorizontal size={18} /> Filtros
              </button>
              <select className="gp-sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
                <option value="latest">Mais Recentes</option>
                <option value="low-high">Menor Preço</option>
                <option value="high-low">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="gp-main-layout">
        <Sidebar />

        <main className="gp-content">
          {loading ? (
            <div className="gp-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="gp-card skeleton">
                  <div className="gp-card-img" /><div className="gp-card-body"><div /><div /></div>
                </div>
              ))}
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="gp-empty">
              <Gift size={40} strokeWidth={1} />
              <p>Nenhum presente encontrado.</p>
              <button onClick={() => { setSearchTerm(''); setPriceFilter('all'); setCategoryFilter('Todas'); setBrandFilter('Todas'); }} className="gp-buy-btn" style={{ marginTop: '1rem' }}>Ver Tudo</button>
            </div>
          ) : (
            <div className="gp-grid">
              {visibleGifts.map((g, idx) => {
                const priceParts = formatPrice(g.price);
                const isLast = idx === visibleGifts.length - 1;
                return (
                  <div key={g.id} className={`gp-card ${g.isBought ? 'bought' : ''} `} ref={isLast ? lastElementRef : null}>
                    {g.isFeatured && <div className="gp-badge"><Star size={10} fill="white" /> Sugestão dos Noivos</div>}
                    <div className="gp-card-img">
                      {g.imageUrl ? <img src={g.imageUrl} alt={g.title} loading="lazy" /> : <Gift size={48} strokeWidth={0.5} opacity={0.2} />}
                    </div>
                    <div className="gp-card-body">
                      <h3>{g.title}</h3>
                      {g.brand && <span className="gp-card-brand">{g.brand}</span>}
                      {g.subtitle && <p className="gp-card-subtitle">{g.subtitle}</p>}
                      <div className="gp-price-wrap">
                        <span className="gp-price-label">Valor Sugerido</span>
                        <p className="gp-price"><span>R$</span>{priceParts.main}<small>,{priceParts.cents}</small></p>
                      </div>

                      {g.isBought ? (
                        <div className="gp-bought-tag">
                          <Check size={14} /> Presenteado por {g.boughtBy}
                        </div>
                      ) : (
                        <button onClick={() => setBuyingGift(g)} className="gp-buy-btn">
                          <ShoppingBag size={18} /> Presentear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {buyingGift && (
          <motion.div
            className="gp-mobile-modal"
            style={{ zIndex: 10000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBuyingGift(null)}
          >
            <motion.div
              className="gp-mobile-drawer"
              style={{ padding: '2rem' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="gp-drawer-header" style={{ padding: '0 0 1rem 0' }}>
                <h2>Confirmar Presente</h2>
                <button onClick={() => setBuyingGift(null)}><X size={24} /></button>
              </div>

              <div className="gp-checkout-address" style={{
                background: '#fdfaf4',
                border: '1px dashed var(--mk-accent)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <MapPin size={24} color="var(--mk-accent)" style={{ flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--mk-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Endereço para Entrega</h4>
                  {/* <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: '#444' }}>
                    <strong>{DELIVERY_DATA.recipient}</strong><br />
                    {DELIVERY_DATA.line1}<br />
                    {DELIVERY_DATA.line2}<br />
                    {DELIVERY_DATA.city}<br />
                    CEP: {DELIVERY_DATA.zip}
                  </p> */}
                  <h2>EM CONSTRUÇÃO</h2>
                  <button
                    onClick={handleCopyAddress}
                    type="button"
                    style={{
                      marginTop: '1.2rem',
                      width: '100%',
                      background: 'white',
                      border: '1px solid var(--mk-accent)',
                      color: 'var(--mk-accent)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Copy size={14} /> {addressCopied ? 'Endereço Copiado!' : 'Copiar Endereço Completo'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--mk-text-sub)', marginBottom: '1rem' }}>
                Para que possamos saber quem nos presenteou, por favor informe seu nome:
              </p>

              <form onSubmit={handleBuy}>
                <input
                  type="text"
                  className="gp-input"
                  placeholder="Seu nome completo"
                  autoFocus
                  required
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '1.2rem' }}
                />
                <button type="submit" disabled={submitting} className="gp-buy-btn" style={{ width: '100%', margin: 0, height: '54px' }}>
                  {submitting ? 'Processando...' : 'Confirmar e Ver Link do Produto'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            className="gp-mobile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              className="gp-mobile-drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="gp-drawer-header">
                <h2>Filtrar Presentes</h2>
                <button onClick={() => setShowMobileFilters(false)}><X size={24} /></button>
              </div>
              <div className="gp-drawer-content">
                <Sidebar />
                <button className="gp-buy-btn" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowMobileFilters(false)}>Aplicar Filtros</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="gp-footer">
        <Heart size={16} fill="#c5a059" color="#c5a059" style={{ marginBottom: '1rem' }} />
        <p>Luan & Laís · 2026</p>
      </footer>
    </div>
  );
};

export default GiftsPublicPage;
