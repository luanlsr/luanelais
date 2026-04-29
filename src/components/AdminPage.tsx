import React, { useState, useEffect, useMemo } from 'react';
import { Users, Gift, Trash2, Plus, Search, CheckCircle2, Star, X, Check, LogOut, CreditCard, MessageCircle, Mail, Phone, Hash, AlertCircle, Pencil } from 'lucide-react';
import { api, type Confirmation, type Gift as GiftType, type Category } from '../services/api';
import { maskPixKey, unmaskValue, maskPhone, maskCurrency, parseCurrency } from '../utils/pix';
import './AdminPage.css';

const ITEMS_PER_PAGE = 15;

type Tab = 'pix' | 'guests' | 'gifts';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('gifts');

  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pixData, setPixData] = useState({ key: '', type: 'email', holder: '' });

  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilter, setGuestFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [giftSearchTerm, setGiftSearchTerm] = useState('');
  const [giftFilter, setGiftFilter] = useState<'all' | 'bought' | 'available'>('all');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('Todas');
  const [showAdminFilters, setShowAdminFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sentReminders, setSentReminders] = useState<string[]>([]);

  /* ── CUSTOM DIALOG STATE ── */
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
  const showInfo = (title: string, message: string) => setDialog({ isOpen: true, title, message, type: 'info' });
  const showConfirm = (title: string, message: string, onConfirm: () => void) =>
    setDialog({ isOpen: true, title, message, type: 'confirm', onConfirm });

  /* ── GIFT MODAL ── */
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftTitle, setGiftTitle] = useState('');
  const [giftSubtitle, setGiftSubtitle] = useState('');
  const [giftBrand, setGiftBrand] = useState('');
  const [giftCategory, setGiftCategory] = useState('');
  const [giftPrice, setGiftPrice] = useState('');
  const [giftImageUrl, setGiftImageUrl] = useState('');
  const [giftBuyUrl, setGiftBuyUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);

  const resetGiftForm = () => {
    setEditingGiftId(null);
    setGiftTitle('');
    setGiftSubtitle('');
    setGiftBrand('');
    setGiftCategory('');
    setGiftPrice('');
    setGiftImageUrl('');
    setGiftBuyUrl('');
    setIsFeatured(false);
  };

  /* ── GUEST MODAL ── */
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestFullName, setGuestFullName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestIsAttending, setGuestIsAttending] = useState(true);
  const [guestChildren, setGuestChildren] = useState<{ name: string; age: string }[]>([]);

  const resetGuestForm = () => {
    setEditingGuestId(null);
    setGuestFullName('');
    setGuestPhone('');
    setGuestEmail('');
    setGuestIsAttending(true);
    setGuestChildren([]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [conf, gf, px, cats] = await Promise.all([
        api.getConfirmations(),
        api.getGifts(),
        api.getPixData(),
        api.getCategories()
      ]);
      setConfirmations(conf);
      setGifts(gf);
      setPixData({ ...px, key: maskPixKey(px.key, px.type) });
      setCategories(cats);
    } catch (err) {
      showInfo('Erro', 'Não foi possível carregar os dados.');
    }
  };

  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const parts = formatted.split(',');
    return { main: parts[0], cents: parts[1] };
  };

  const openWhatsAppRemind = (id: string, phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const firstName = name.split(' ')[0];
    const message = encodeURIComponent(`Olá ${firstName}, tudo bem? Estamos muito felizes com a chegada do nosso casamento! 🥂\n\nPassando para confirmar se você e seus dependentes registrados ainda poderão comparecer no dia 07/11/2026.\n\nPoderia nos confirmar por aqui? Um abraço, de Laís & Luan.`);
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
    if (!sentReminders.includes(id)) {
      setSentReminders(prev => [...prev, id]);
    }
  };

  const handleEditGift = (g: GiftType) => {
    setEditingGiftId(g.id);
    setGiftTitle(g.title);
    setGiftSubtitle(g.subtitle || '');
    setGiftBrand(g.brand || '');
    setGiftCategory(g.categoryId || '');
    setGiftPrice(maskCurrency(Math.round(g.price * 100).toString()));
    setGiftImageUrl(g.imageUrl);
    setGiftBuyUrl(g.buyUrl || '');
    setIsFeatured(g.isFeatured || false);
    setIsGiftModalOpen(true);
  };

  const handleEditGuest = (c: Confirmation) => {
    setEditingGuestId(c.id);
    setGuestFullName(c.fullName);
    setGuestPhone(c.phone);
    setGuestEmail(c.email || '');
    setGuestIsAttending(c.isAttending);
    setGuestChildren(c.children || []);
    setIsGuestModalOpen(true);
  };

  const filteredGuests = useMemo(() => {
    let result = confirmations;

    // Filter by presence
    if (guestFilter === 'yes') {
      result = result.filter(c => c.isAttending);
    } else if (guestFilter === 'no') {
      result = result.filter(c => !c.isAttending);
    }

    // Filter by search
    if (guestSearch.trim()) {
      const q = guestSearch.toLowerCase();
      result = result.filter(c =>
        c.fullName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    return result;
  }, [confirmations, guestSearch, guestFilter]);

  const filteredGifts = useMemo(() => {
    let result = gifts;

    // Filter by status
    if (giftFilter === 'bought') {
      result = result.filter(g => g.isBought);
    } else if (giftFilter === 'available') {
      result = result.filter(g => !g.isBought);
    }

    if (giftSearchTerm.trim()) {
      const q = giftSearchTerm.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.subtitle?.toLowerCase().includes(q) ||
        g.brand?.toLowerCase().includes(q)
      );
    }
    if (adminCategoryFilter !== 'Todas') {
      result = result.filter(g => g.categoryId === adminCategoryFilter);
    }
    return result;
  }, [gifts, giftSearchTerm, adminCategoryFilter, giftFilter]);

  const stats = useMemo(() => {
    const attending = confirmations.filter(c => c.isAttending);
    const notAttending = confirmations.filter(c => !c.isAttending);
    
    const adults = attending.length;
    let kids = 0;
    attending.forEach(c => kids += (c.children?.length || 0));
    
    return { 
      adults, 
      kids, 
      total: adults + kids,
      attendingCount: attending.length,
      notAttending: notAttending.length 
    };
  }, [confirmations]);

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <h1>L & L · Management</h1>
      </header>

      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}><Gift size={18} /> Presentes</button>
        <button className={`adm-tab ${tab === 'guests' ? 'active' : ''}`} onClick={() => setTab('guests')}><Users size={18} /> Convidados</button>
        <button className={`adm-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}><CreditCard size={18} /> Pix</button>
      </nav>

      <main className="adm-content">
        {tab === 'guests' && (
          <div className="reveal active">
            <div className="adm-stats-grid">
              <div className="adm-stat-card"><span className="adm-stat-label">Total Convidados</span><span className="adm-stat-value">{stats.total}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Famílias (Vão)</span><span className="adm-stat-value" style={{ color: '#25D366' }}>{stats.attendingCount}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Famílias (Não Vão)</span><span className="adm-stat-value" style={{ color: '#991b1b' }}>{stats.notAttending}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Crianças</span><span className="adm-stat-value">{stats.kids}</span></div>
            </div>

            <div className="adm-guest-filters-bar">
              <div className="adm-search-wrap" style={{ flex: 1, marginBottom: 0 }}>
                <Search size={22} />
                <input className="adm-search-input" placeholder="Pesquisar convidados..." value={guestSearch} onChange={e => setGuestSearch(e.target.value)} />
              </div>

              <div className="adm-filter-group">
                <button 
                  className={`adm-filter-btn ${guestFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setGuestFilter('all')}
                >
                  Todos <span>{confirmations.length}</span>
                </button>
                <button 
                  className={`adm-filter-btn ${guestFilter === 'yes' ? 'active' : ''}`}
                  onClick={() => setGuestFilter('yes')}
                >
                  Vão <span>{stats.attendingCount}</span>
                </button>
                <button 
                  className={`adm-filter-btn ${guestFilter === 'no' ? 'active' : ''}`}
                  onClick={() => setGuestFilter('no')}
                >
                  Não Vão <span>{stats.notAttending}</span>
                </button>
              </div>
            </div>

            <div className="adm-list">
              {filteredGuests.slice(0, visibleCount).map(c => {
                const isExpanded = expandedId === c.id;
                const isSent = sentReminders.includes(c.id);
                return (
                  <div key={c.id} className={`adm-guest-row ${isExpanded ? 'expanded' : ''}`} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div className="adm-row-main">
                      <div className="adm-guest-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <h4 style={{ opacity: isSent || !c.isAttending ? 0.4 : 1 }}>{c.fullName}</h4>
                          {c.isAttending ? (
                            <span className="adm-status-badge yes">SIM</span>
                          ) : (
                            <span className="adm-status-badge no">NÃO</span>
                          )}
                          {isSent && <button onClick={(e) => { e.stopPropagation(); setSentReminders(prev => prev.filter(id => id !== c.id)); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} color="#25D366" /></button>}
                        </div>
                        {c.isAttending ? (
                          c.children && c.children.length > 0 && <span style={{ opacity: isSent ? 0.3 : 1 }}>{1 + c.children.length} Pessoas</span>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Avisou que não poderá ir</span>
                        )}
                      </div>
                      <div className="adm-row-actions hide-mobile" onClick={e => e.stopPropagation()}>
                        <button className="adm-btn-icon wa" style={{ background: isSent ? '#f0f0f0' : '#25D366' }} onClick={() => openWhatsAppRemind(c.id, c.phone, c.fullName)}>
                          <MessageCircle size={20} fill={isSent ? '#ccc' : 'white'} />
                        </button>
                        <button className="adm-btn-icon" style={{ background: '#f5f5f4', color: '#2D3820' }} onClick={() => handleEditGuest(c)}>
                          <Pencil size={18} />
                        </button>
                        <button className="adm-btn-icon trash" onClick={() => showConfirm('Excluir Convidado', `Deseja realmente remover ${c.fullName}?`, () => { 
                          api.removeConfirmation(c.id)
                            .then(() => { loadAll(); closeDialog(); })
                            .catch(err => { 
                              console.error(err);
                              showInfo('Erro ao remover', 'Não foi possível excluir o convidado.');
                            });
                        })}><Trash2 size={20} /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="adm-row-detail" onClick={e => e.stopPropagation()}>
                        <div className="adm-row-actions show-mobile" style={{ gridColumn: '1 / -1', marginBottom: '1rem', justifyContent: 'flex-start' }}>
                          <button className="adm-btn-icon wa" style={{ background: isSent ? '#f0f0f0' : '#25D366' }} onClick={() => openWhatsAppRemind(c.id, c.phone, c.fullName)}>
                            <MessageCircle size={20} fill={isSent ? '#ccc' : 'white'} />
                          </button>
                          <button className="adm-btn-icon" style={{ background: '#f5f5f4', color: '#2D3820' }} onClick={() => handleEditGuest(c)}>
                            <Pencil size={18} />
                          </button>
                          <button className="adm-btn-icon trash" onClick={() => showConfirm('Excluir Convidado', `Deseja realmente remover ${c.fullName}?`, () => { 
                            api.removeConfirmation(c.id)
                              .then(() => { loadAll(); closeDialog(); })
                              .catch(err => { 
                                console.error(err);
                                showInfo('Erro ao remover', 'Não foi possível excluir o convidado.');
                              });
                          })}><Trash2 size={20} /></button>
                        </div>
                        <div className="adm-detail-item"><label><Mail size={10} /> E-mail</label><p>{c.email || '—'}</p></div>
                        <div className="adm-detail-item"><label><Phone size={10} /> Telefone</label><p>{maskPhone(c.phone)}</p></div>
                        {c.children && c.children.length > 0 && (
                          <div className="adm-detail-item" style={{ gridColumn: '1 / -1' }}>
                            <label><Hash size={10} /> Dependentes</label>
                            <div>{c.children.map((ch, i) => <span key={i} className="adm-badge-child">{ch.name} ({ch.age}a)</span>)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {visibleCount < filteredGuests.length && (
              <button
                className="adm-load-more"
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              >
                Mostrar Mais ({filteredGuests.length - visibleCount} restantes)
              </button>
            )}
          </div>
        )}


        {tab === 'gifts' && (
          <div className="reveal active">
            <div className="adm-section-header">
              <div className="adm-section-title">
                <div className="adm-header-actions" style={{ marginLeft: 'auto' }}>
                   <button className="adm-filter-toggle" onClick={() => setShowAdminFilters(!showAdminFilters)}><Search size={18} /> Filtrar</button>
                   <button className="adm-btn-submit" onClick={() => { resetGiftForm(); setIsGiftModalOpen(true); }}><Plus /> <span className="hide-mobile">Novo</span></button>
                </div>
              </div>

              <div className="adm-guest-filters-bar" style={{ marginBottom: '1.5rem', background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' }}>
                <div className="adm-filter-group" style={{ width: 'auto' }}>
                  <button 
                    className={`adm-filter-btn ${giftFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setGiftFilter('all')}
                  >
                    Todos <span>{gifts.length}</span>
                  </button>
                  <button 
                    className={`adm-filter-btn ${giftFilter === 'bought' ? 'active' : ''}`}
                    onClick={() => setGiftFilter('bought')}
                  >
                    Ganhos <span>{gifts.filter(g => g.isBought).length}</span>
                  </button>
                  <button 
                    className={`adm-filter-btn ${giftFilter === 'available' ? 'active' : ''}`}
                    onClick={() => setGiftFilter('available')}
                  >
                    Disponíveis <span>{gifts.filter(g => !g.isBought).length}</span>
                  </button>
                </div>
              </div>
              
              <div className={`adm-filter-bar ${showAdminFilters ? 'show' : ''}`}>
                <div className="adm-search-wrap">
                  <Search size={18} />
                  <input 
                    className="adm-search-input" 
                    placeholder="Buscar por nome, marca..." 
                    value={giftSearchTerm}
                    onChange={e => setGiftSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="adm-login-input adm-filter-select" 
                  value={adminCategoryFilter}
                  onChange={e => setAdminCategoryFilter(e.target.value)}
                >
                  <option value="Todas">Todas Categorias</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {filteredGifts.map(g => {
                const priceParts = formatPrice(g.price);
                return (
                  <div key={g.id} className={`gp-card ${g.isBought ? 'bought' : ''}`}>
                    {g.isFeatured && <div className="gp-badge"><Star size={10} fill="white" /> Sugestão dos Noivos</div>}
                    <div className="gp-card-img">
                      {g.imageUrl ? <img src={g.imageUrl} alt={g.title} /> : <Gift size={48} strokeWidth={0.5} opacity={0.2} />}
                    </div>
                    <div className="gp-card-body">
                      <h3>{g.title}</h3>
                      {g.brand && <span className="gp-card-brand">{g.brand}</span>}
                      {g.subtitle && <p className="gp-card-subtitle">{g.subtitle}</p>}
                      <div className="gp-price-wrap">
                        <span className="gp-price-label">Valor Sugerido</span>
                        <p className="gp-price"><span>R$</span>{priceParts.main}<small>,{priceParts.cents}</small></p>
                      </div>

                      {g.isBought && (
                        <div className="gp-bought-tag" style={{ marginBottom: '1rem' }}>
                          <Check size={14} /> Presenteado por {g.boughtBy}
                        </div>
                      )}

                      <button 
                        className="adm-btn-logout" 
                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', background: '#f5f5f4', color: '#2D3820', border: 'none', marginBottom: '0.5rem' }} 
                        onClick={() => handleEditGift(g)}
                      >
                        Editar
                      </button>

                      <button 
                        className="adm-btn-logout" 
                        style={{ width: '100%', justifyContent: 'center', background: '#fee2e2', color: '#991b1b', border: 'none' }} 
                        onClick={() => showConfirm('Remover Presente', 'Deseja excluir este item da vitrine?', () => { 
                          api.removeGift(g.id)
                            .then(() => { loadAll(); closeDialog(); })
                            .catch(err => {
                              console.error(err);
                              showInfo('Erro ao remover', 'Não foi possível excluir o presente.');
                            });
                        })}
                      >
                        <Trash2 size={16} /> Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'pix' && (
          <div className="reveal active">
            <div className="adm-stat-card" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
              <span className="adm-stat-label">Configuração Pix</span>
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.2rem' }}>
                <div className="adm-form-field"><label>Tipo de Chave</label><select className="adm-login-input" value={pixData.type} onChange={(e) => setPixData({ ...pixData, type: e.target.value })}><option value="email">E-mail</option><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="cell">Celular</option><option value="random">Chave Aleatória</option></select></div>
                <div className="adm-form-field"><label>Chave Pix</label><input className="adm-login-input" value={pixData.key} onChange={(e) => setPixData({ ...pixData, key: maskPixKey(e.target.value, pixData.type) })} /></div>
                <div className="adm-form-field"><label>Titular</label><input className="adm-login-input" value={pixData.holder} onChange={(e) => setPixData({ ...pixData, holder: e.target.value })} /></div>
                <button className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }} onClick={async () => { await api.updatePixData(unmaskValue(pixData.key), pixData.type, pixData.holder); showInfo('Sucesso', 'Dados do Pix salvos com segurança!'); }}>Salvar Pix</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── MODALS & DIALOGS ── */}
      {isGiftModalOpen && (
        <div className="adm-modal-overlay" onClick={() => setIsGiftModalOpen(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{editingGiftId ? 'Editar Presente' : 'Novo Presente'}</h3>
              <button className="adm-close-btn" onClick={() => setIsGiftModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const payload = {
                  title: giftTitle,
                  subtitle: giftSubtitle,
                  brand: giftBrand,
                  category: giftCategory,
                  price: parseCurrency(giftPrice),
                  imageUrl: giftImageUrl,
                  buyUrl: giftBuyUrl,
                  isFeatured
                };

                if (editingGiftId) {
                  await api.updateGift(editingGiftId, payload);
                } else {
                  await api.addGift(payload);
                }

                setIsGiftModalOpen(false);
                resetGiftForm();
                loadAll();
                showInfo('Feito!', editingGiftId ? 'Presente atualizado com sucesso.' : 'Presente adicionado com sucesso.');
              }} style={{ display: 'grid', gap: '1.2rem' }}>
                <div className="adm-form-field"><label>Título</label><input className="adm-login-input" value={giftTitle} onChange={e => setGiftTitle(e.target.value)} required placeholder="Ex: Air Fryer" /></div>
                <div className="adm-form-field"><label>Subtítulo (Opcional)</label><input className="adm-login-input" value={giftSubtitle} onChange={e => setGiftSubtitle(e.target.value)} placeholder="Ex: Forno 5 em 1 12L" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="adm-form-field"><label>Marca</label><input className="adm-login-input" value={giftBrand} onChange={e => setGiftBrand(e.target.value)} placeholder="Ex: Electrolux" /></div>
                  <div className="adm-form-field">
                    <label>Categoria</label>
                    <select className="adm-login-input" value={giftCategory} onChange={e => setGiftCategory(e.target.value)} required>
                      <option value="">Selecione uma categoria...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="adm-form-field"><label>Preço (Sugestão)</label><input className="adm-login-input" value={giftPrice} onChange={e => setGiftPrice(maskCurrency(e.target.value))} required placeholder="0,00" /></div>
                  <div className="adm-form-field"><label>Link de Compra</label><input className="adm-login-input" value={giftBuyUrl} onChange={e => setGiftBuyUrl(e.target.value)} placeholder="https://..." /></div>
                </div>
                <div className="adm-form-field"><label>URL Imagem</label><input className="adm-login-input" value={giftImageUrl} onChange={e => setGiftImageUrl(e.target.value)} required placeholder="https://..." /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem' }}>
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label style={{ fontSize: '0.9rem', color: 'var(--adm-text-sub)', cursor: 'pointer' }}>Sugestão dos Noivos (Destaque)</label>
                </div>
                <button type="submit" className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }}>Adicionar Presente</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isGuestModalOpen && (
        <div className="adm-modal-overlay" onClick={() => setIsGuestModalOpen(false)}>
          <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>Editar Convidado</h3>
              <button className="adm-close-btn" onClick={() => setIsGuestModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!editingGuestId) return;

                const payload = {
                  fullName: guestFullName,
                  phone: guestPhone,
                  email: guestEmail,
                  isAttending: guestIsAttending,
                  children: guestIsAttending ? guestChildren : []
                };

                try {
                  await api.updateConfirmation(editingGuestId, payload);
                  setIsGuestModalOpen(false);
                  resetGuestForm();
                  loadAll();
                  showInfo('Sucesso', 'Convidado atualizado com sucesso.');
                } catch (err) {
                  showInfo('Erro', 'Não foi possível salvar as alterações.');
                }
              }} style={{ display: 'grid', gap: '1.2rem' }}>
                <div className="adm-form-field"><label>Nome Completo</label><input className="adm-login-input" value={guestFullName} onChange={e => setGuestFullName(e.target.value)} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="adm-form-field"><label>Telefone</label><input className="adm-login-input" value={guestPhone} onChange={e => setGuestPhone(maskPhone(e.target.value))} required /></div>
                  <div className="adm-form-field"><label>E-mail (Opcional)</label><input className="adm-login-input" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', background: '#f9f9f8', borderRadius: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="isAttending"
                    checked={guestIsAttending} 
                    onChange={e => {
                      setGuestIsAttending(e.target.checked);
                      if (!e.target.checked) setGuestChildren([]);
                    }} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                  />
                  <label htmlFor="isAttending" style={{ fontSize: '0.9rem', color: 'var(--adm-text-sub)', cursor: 'pointer', fontWeight: 500 }}>Comparecerá ao evento</label>
                </div>

                {guestIsAttending && (
                  <div className="adm-form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                      <label>Dependentes</label>
                      <button type="button" className="adm-btn-submit" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => setGuestChildren([...guestChildren, { name: '', age: '' }])}>+ Adicionar</button>
                    </div>
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                      {guestChildren.map((child, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                          <input className="adm-login-input" style={{ flex: 1 }} placeholder="Nome" value={child.name} onChange={e => {
                            const newC = [...guestChildren];
                            newC[idx].name = e.target.value;
                            setGuestChildren(newC);
                          }} required />
                          <input className="adm-login-input" style={{ width: '60px' }} placeholder="Idade" value={child.age} onChange={e => {
                            const newC = [...guestChildren];
                            newC[idx].age = e.target.value;
                            setGuestChildren(newC);
                          }} required />
                          <button type="button" className="adm-btn-icon trash" style={{ padding: '0.5rem' }} onClick={() => setGuestChildren(guestChildren.filter((_, i) => i !== idx))}><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>Salvar Alterações</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {dialog.isOpen && <CustomDialog {...dialog} onClose={closeDialog} />}
    </div>
  );
};

const CustomDialog: React.FC<{ isOpen: boolean, title: string, message: string, type: 'info' | 'confirm', onConfirm?: () => void, onClose: () => void }> = ({ title, message, type, onConfirm, onClose }) => (
  <div className="adm-dialog-overlay" onClick={onClose}>
    <div className="adm-dialog-content" onClick={e => e.stopPropagation()}>
      {type === 'info' ? <CheckCircle2 size={40} color="#c5a059" style={{ marginBottom: '1rem' }} /> : <AlertCircle size={40} color="#2D3820" style={{ marginBottom: '1rem' }} />}
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="adm-dialog-actions">
        {type === 'confirm' ? (
          <>
            <button className="adm-btn-icon trash" style={{ width: 'auto', padding: '0 2rem', borderRadius: '50px' }} onClick={onClose}>Cancelar</button>
            <button className="adm-btn-submit" onClick={onConfirm}>Confirmar</button>
          </>
        ) : (
          <button className="adm-btn-submit" onClick={onClose}>Excelente</button>
        )}
      </div>
    </div>
  </div>
);

export default AdminPage;
