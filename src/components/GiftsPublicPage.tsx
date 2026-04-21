import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ArrowLeft, Heart, ShoppingBag, Search, SlidersHorizontal, X, Star } from 'lucide-react';
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
              <button onClick={() => {setSearchTerm(''); setPriceFilter('all'); setCategoryFilter('Todas'); setBrandFilter('Todas');}} className="gp-buy-btn" style={{marginTop: '1rem'}}>Ver Tudo</button>
            </div>
          ) : (
            <div className="gp-grid">
              {visibleGifts.map((g, idx) => {
                const priceParts = formatPrice(g.price);
                const isLast = idx === visibleGifts.length - 1;
                return (
                  <div key={g.id} className="gp-card" ref={isLast ? lastElementRef : null}>
                    {g.isFeatured && <div className="gp-badge"><Star size={10} fill="white" /> Sugestão dos Noivos</div>}
                    <div className="gp-card-img">
                      {g.imageUrl ? <img src={g.imageUrl} alt={g.title} loading="lazy" /> : <Gift size={48} strokeWidth={0.5} opacity={0.2} />}
                    </div>
                    <div className="gp-card-body">
                      {g.brand && <span className="gp-card-brand">{g.brand}</span>}
                      <h3>{g.title}</h3>
                      {g.subtitle && <p className="gp-card-subtitle">{g.subtitle}</p>}
                      <div className="gp-price-wrap">
                        <span className="gp-price-label">Valor Sugerido</span>
                        <p className="gp-price"><span>R$</span>{priceParts.main}<small>,{priceParts.cents}</small></p>
                      </div>
                      <a href={g.buyUrl || '#'} target="_blank" rel="noopener noreferrer" className="gp-buy-btn">
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
        <div className="gp-mobile-modal" onClick={() => setShowMobileFilters(false)}>
          <div className="gp-mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="gp-drawer-header">
              <h2>Filtrar Presentes</h2>
              <button onClick={() => setShowMobileFilters(false)}><X size={24} /></button>
            </div>
            <div className="gp-drawer-content">
              <Sidebar />
              <button className="gp-buy-btn" style={{width: '100%', marginTop: '2rem'}} onClick={() => setShowMobileFilters(false)}>Aplicar Filtros</button>
            </div>
          </div>
        </div>
      )}

      <footer className="gp-footer">
        <Heart size={16} fill="#c5a059" color="#c5a059" style={{ marginBottom: '1rem' }} />
        <p>Luan & Laís · 2026</p>
      </footer>
    </div>
  );
};

export default GiftsPublicPage;
