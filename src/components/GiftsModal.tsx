import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, ShoppingBag, Search, SlidersHorizontal, X, Star } from 'lucide-react';
import { api, type Gift as GiftType } from '../services/api';
import './GiftsModal.css';

const ITEMS_PER_PAGE = 12;

interface GiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GiftsModal: React.FC<GiftsModalProps> = ({ isOpen, onClose }) => {
  const [allGifts, setAllGifts] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | '200-500' | 'over500'>('all');
  const [sortOrder, setSortOrder] = useState<'latest' | 'low-high' | 'high-low'>('latest');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
    if (isOpen) {
      setLoading(true);
      api.getGifts().then(g => { 
        setAllGifts(g); 
        setLoading(false); 
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const categories = useMemo(() => ['Todas', ...new Set(allGifts.map(g => g.category))].sort(), [allGifts]);
  const brands = useMemo(() => ['Todas', ...new Set(allGifts.map(g => g.brand).filter(Boolean) as string[])].sort(), [allGifts]);

  const visibleGifts = filteredGifts.slice(0, visibleCount);

  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const parts = formatted.split(',');
    return { main: parts[0], cents: parts[1] };
  };

  const Sidebar = () => (
    <aside className="gm-sidebar">
      <div className="gm-sidebar-section">
        <h3>Categorias</h3>
        <ul className="gm-sidebar-list">
          {categories.map(cat => (
            <li key={cat} className={categoryFilter === cat ? 'active' : ''} onClick={() => setCategoryFilter(cat)}>
              {cat}
            </li>
          ))}
        </ul>
      </div>

      <div className="gm-sidebar-section">
        <h3>Marcas</h3>
        <ul className="gm-sidebar-list">
          {brands.map(b => (
            <li key={b} className={brandFilter === b ? 'active' : ''} onClick={() => setBrandFilter(b)}>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="gm-sidebar-section">
        <h3>Preço</h3>
        <ul className="gm-sidebar-list">
          <li className={priceFilter === 'all' ? 'active' : ''} onClick={() => setPriceFilter('all')}>Todos</li>
          <li className={priceFilter === 'under200' ? 'active' : ''} onClick={() => setPriceFilter('under200')}>Até R$ 200</li>
          <li className={priceFilter === '200-500' ? 'active' : ''} onClick={() => setPriceFilter('200-500')}>R$ 200 - R$ 500</li>
          <li className={priceFilter === 'over500' ? 'active' : ''} onClick={() => setPriceFilter('over500')}>Acima de R$ 500</li>
        </ul>
      </div>
    </aside>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="gm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="gm-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <header className="gm-header">
              <button onClick={onClose} className="gm-close-btn">
                <X size={24} />
              </button>
              <div className="gm-header-content">
                <h1>Lista de Presentes</h1>
                <p>Laís & Luan · 07.11.2026</p>
              </div>

              <div className="gm-tools">
                <div className="gm-search-row">
                  <div className="gm-search-bar">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Busque por marca, produto..." 
                      value={searchTerm}
                      onChange={e => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                    />
                  </div>
                  <div className="gm-mobile-actions-row">
                    <button className="gm-mobile-filter-btn" onClick={() => setShowMobileFilters(true)}>
                      <SlidersHorizontal size={18} /> Filtros
                    </button>
                    <select className="gm-sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value as any)}>
                      <option value="latest">Mais Recentes</option>
                      <option value="low-high">Menor Preço</option>
                      <option value="high-low">Maior Preço</option>
                    </select>
                  </div>
                </div>
              </div>
            </header>

            <div className="gm-main-layout">
              <Sidebar />

              <main className="gm-content">
                {loading ? (
                  <div className="gm-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="gm-card skeleton">
                        <div className="gm-card-img" /><div className="gm-card-body"><div /><div /></div>
                      </div>
                    ))}
                  </div>
                ) : filteredGifts.length === 0 ? (
                  <div className="gm-empty">
                    <Gift size={40} strokeWidth={1} />
                    <p>Nenhum presente encontrado.</p>
                    <button onClick={() => {setSearchTerm(''); setPriceFilter('all'); setCategoryFilter('Todas'); setBrandFilter('Todas');}} className="gm-buy-btn" style={{marginTop: '1rem'}}>Ver Tudo</button>
                  </div>
                ) : (
                  <div className="gm-grid">
                    {visibleGifts.map((g, idx) => {
                      const priceParts = formatPrice(g.price);
                      const isLast = idx === visibleGifts.length - 1;
                      return (
                        <div key={g.id} className="gm-card" ref={isLast ? lastElementRef : null}>
                          {g.isFeatured && <div className="gm-badge"><Star size={10} fill="white" /> Sugestão</div>}
                          <div className="gm-card-img">
                            {g.imageUrl ? <img src={g.imageUrl} alt={g.title} loading="lazy" /> : <Gift size={48} strokeWidth={0.5} opacity={0.2} />}
                          </div>
                          <div className="gm-card-body">
                            {g.brand && <span className="gm-card-brand">{g.brand}</span>}
                            <h3>{g.title}</h3>
                            <div className="gm-price-wrap">
                              <p className="gm-price"><span>R$</span>{priceParts.main}<small>,{priceParts.cents}</small></p>
                            </div>
                            <a href={g.buyUrl || '#'} target="_blank" rel="noopener noreferrer" className="gm-buy-btn">
                              <ShoppingBag size={18} /> Presentear
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </main>
            </div>

            {showMobileFilters && (
              <div className="gm-mobile-filters-overlay" onClick={() => setShowMobileFilters(false)}>
                <div className="gm-mobile-drawer" onClick={e => e.stopPropagation()}>
                  <div className="gm-drawer-header">
                    <h2>Filtrar</h2>
                    <button onClick={() => setShowMobileFilters(false)}><X size={24} /></button>
                  </div>
                  <div className="gm-drawer-content">
                    <Sidebar />
                    <button className="gm-buy-btn" style={{width: '100%', marginTop: '2rem'}} onClick={() => setShowMobileFilters(false)}>Aplicar</button>
                  </div>
                </div>
              </div>
            )}

            <footer className="gm-footer">
              <Heart size={16} fill="#c5a059" color="#c5a059" style={{ marginBottom: '0.5rem' }} />
              <p>Laís & Luan · 2026</p>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GiftsModal;
