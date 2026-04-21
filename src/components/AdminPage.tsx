import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Key, Users, Gift, Trash2, Plus, Search, CheckCircle2, CreditCard, Star, X, MessageCircle, ChevronDown, ChevronUp, Calendar, Mail, Phone, Hash, Check } from 'lucide-react';
import { api, type Confirmation, type Gift as GiftType } from '../services/api';
import { maskPixKey, unmaskValue, maskPhone } from '../utils/pix';
import './AdminPage.css';

const ADMIN_USER = 'luanelais';
const ADMIN_PASS = '07112026';
const ITEMS_PER_PAGE = 15;

type Tab = 'pix' | 'guests' | 'gifts';

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('guests');

  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [pixData, setPixData] = useState({ key: '', type: 'email', holder: '' });

  const [guestSearch, setGuestSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sentReminders, setSentReminders] = useState<string[]>([]); // Estado local para controle da sessão de disparos

  /* ── GIFT MODAL ── */
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftTitle, setGiftTitle] = useState('');
  const [giftSubtitle, setGiftSubtitle] = useState('');
  const [giftBrand, setGiftBrand] = useState('');
  const [giftCategory, setGiftCategory] = useState('Geral');
  const [giftPrice, setGiftPrice] = useState('');
  const [giftImageUrl, setGiftImageUrl] = useState('');
  const [giftBuyUrl, setGiftBuyUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  const loadAll = async () => {
    const [conf, gf, px] = await Promise.all([
      api.getConfirmations(),
      api.getGifts(),
      api.getPixData()
    ]);
    setConfirmations(conf);
    setGifts(gf);
    setPixData(px);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  const openWhatsAppRemind = (id: string, phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    
    const firstName = name.split(' ')[0];
    const message = encodeURIComponent(`Olá ${firstName}, tudo bem? Estamos muito felizes com a chegada do nosso casamento! 🥂

Passando para confirmar se você e seus dependentes registrados ainda poderão comparecer no dia 07/11/2026.

Poderia nos confirmar por aqui? Um abraço, de Luan & Laís.`);

    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
    
    // Marca como enviado localmente para controle visual do "lote"
    if (!sentReminders.includes(id)) {
      setSentReminders(prev => [...prev, id]);
    }
  };

  const filteredGuests = useMemo(() => {
    if (!guestSearch.trim()) return confirmations;
    const q = guestSearch.toLowerCase();
    return confirmations.filter(c => 
      c.fullName.toLowerCase().includes(q) || 
      c.email?.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [confirmations, guestSearch]);

  const stats = useMemo(() => {
    const adults = confirmations.length;
    let kids = 0;
    confirmations.forEach(c => kids += (c.children?.length || 0));
    return { adults, kids, total: adults + kids };
  }, [confirmations]);

  if (!authed) {
    return (
      <div className="adm-login-page">
        <form className="adm-login-card" onSubmit={handleLogin}>
          <h2>Acesso Admin</h2>
          <div style={{ marginBottom: '2rem' }}>
            <input className="adm-login-input" placeholder="Usuário" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            <input className="adm-login-input" type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
          </div>
          {loginError && <p style={{ color: '#ff4d4f', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{loginError}</p>}
          <button type="submit" className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }}>Entrar no Painel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <h1>L & L · Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="adm-btn-logout" onClick={() => setSentReminders([])} title="Limpar checklist de envios">
             Reset Checklist
          </button>
          <button className="adm-btn-logout" onClick={handleLogout}><LogOut size={14} /> Sair</button>
        </div>
      </header>

      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'guests' ? 'active' : ''}`} onClick={() => setTab('guests')}><Users size={18} /> Convidados</button>
        <button className={`adm-tab ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}><Gift size={18} /> Presentes</button>
        <button className={`adm-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}><CreditCard size={18} /> Pix</button>
      </nav>

      <main className="adm-content">
        {tab === 'guests' && (
          <div className="reveal active">
            <div className="adm-stats-grid">
              <div className="adm-stat-card"><span className="adm-stat-label">Total Pessoas</span><span className="adm-stat-value">{stats.total}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Adultos</span><span className="adm-stat-value">{stats.adults}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Crianças</span><span className="adm-stat-value">{stats.kids}</span></div>
            </div>

            <div className="adm-search-wrap">
              <Search size={22} />
              <input 
                className="adm-search-input" 
                placeholder="Pesquisar convidados..." 
                value={guestSearch} 
                onChange={e => setGuestSearch(e.target.value)} 
              />
            </div>

            <div className="adm-list">
              {filteredGuests.slice(0, visibleCount).map(c => {
                const isExpanded = expandedId === c.id;
                const isSent = sentReminders.includes(c.id);
                const total = 1 + (c.children?.length || 0);
                return (
                  <div key={c.id} className={`adm-guest-row ${isExpanded ? 'expanded' : ''}`} onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div className="adm-row-main">
                      <div className="adm-guest-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <h4 style={{ opacity: isSent ? 0.4 : 1 }}>{c.fullName}</h4>
                          {isSent && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSentReminders(prev => prev.filter(id => id !== c.id));
                              }}
                              style={{ 
                                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                display: 'flex', alignItems: 'center'
                              }}
                              title="Desmarcar envio"
                            >
                              <Check size={16} color="#25D366" />
                            </button>
                          )}
                        </div>
                        {c.children && c.children.length > 0 && (
                          <span style={{ opacity: isSent ? 0.3 : 1 }}>{total} Pessoas</span>
                        )}
                      </div>
                      <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
                        <button 
                          className="adm-btn-icon wa" 
                          style={{ 
                            background: isSent ? '#f0f0f0' : '#25D366', 
                            color: isSent ? '#ccc' : 'white',
                            opacity: isSent ? 0.6 : 1
                          }} 
                          onClick={() => openWhatsAppRemind(c.id, c.phone, c.fullName)}
                        >
                          <MessageCircle size={20} fill={isSent ? '#ccc' : 'white'} />
                        </button>
                        <button className="adm-btn-icon trash" onClick={() => { if(window.confirm('Excluir?')) api.removeConfirmation(c.id).then(loadAll) }}>
                          <Trash2 size={20} />
                        </button>
                        {isExpanded ? <ChevronUp size={20} opacity={0.3} /> : <ChevronDown size={20} opacity={0.3} />}
                      </div>
                    </div>
                    
                    <div className="adm-row-detail" onClick={e => e.stopPropagation()}>
                      <div className="adm-detail-item">
                        <label><Mail size={10} /> E-mail</label>
                        <p>{c.email || '—'}</p>
                      </div>
                      <div className="adm-detail-item">
                        <label><Phone size={10} /> Telefone</label>
                        <p>{maskPhone(c.phone)}</p>
                      </div>
                      <div className="adm-detail-item">
                        <label><Calendar size={10} /> Data Confirmação</label>
                        <p>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '-'}</p>
                      </div>
                      {c.children && c.children.length > 0 && (
                        <div className="adm-detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label><Hash size={10} /> Dependentes / Crianças</label>
                          <div>
                            {c.children.map((ch, i) => (
                              <span key={i} className="adm-badge-child">{ch.name} ({ch.age}a)</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {visibleCount < filteredGuests.length && (
              <button className="adm-load-more" onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}>
                Mostrar Mais ({total - visibleCount} restantes)
              </button>
            )}
          </div>
        )}

        {tab === 'gifts' && (
          <div className="reveal active">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ margin: 0, fontWeight: 500, fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Vitrine de Presentes ({gifts.length})</h3>
              <button className="adm-btn-submit" onClick={() => setIsGiftModalOpen(true)}><Plus /> Novo Presente</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {gifts.map(g => (
                <div key={g.id} className="gp-card" style={{ transition: 'none' }}>
                  {g.isFeatured && <div className="gp-badge"><Star size={10} fill="white" /> Sugestão</div>}
                  <div className="gp-card-img"><img src={g.imageUrl} alt="" /></div>
                  <div className="gp-card-body">
                    {g.brand && <span className="gp-card-brand">{g.brand}</span>}
                    <h3 style={{ fontSize: '0.95rem' }}>{g.title}</h3>
                    <p className="gp-card-subtitle" style={{ fontSize: '0.75rem' }}>{g.subtitle}</p>
                    <div className="gp-price-wrap" style={{ border: 'none', paddingTop: 0 }}><p className="gp-price"><span>R$</span>{g.price.toFixed(2)}</p></div>
                    <button className="adm-btn-logout" style={{ marginTop: '1.2rem', width: '100%', justifyContent: 'center' }} onClick={() => { if(window.confirm('Excluir?')) api.removeGift(g.id).then(loadAll) }}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pix' && (
           <div className="reveal active">
              <div className="adm-stat-card" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
                <span className="adm-stat-label">Configuração Pix</span>
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.2rem' }}>
                  <div className="adm-form-field"><label>Tipo de Chave</label><select className="adm-login-input" value={pixData.type} onChange={(e) => setPixData({...pixData, type: e.target.value})}><option value="email">E-mail</option><option value="cpf">CPF</option><option value="cell">WhatsApp</option></select></div>
                  <div className="adm-form-field"><label>Chave</label><input className="adm-login-input" value={pixData.key} onChange={(e) => setPixData({...pixData, key: e.target.value})} /></div>
                  <div className="adm-form-field"><label>Titular</label><input className="adm-login-input" value={pixData.holder} onChange={(e) => setPixData({...pixData, holder: e.target.value})} /></div>
                  <button className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }} onClick={async () => { await api.updatePixData(pixData.key, pixData.type, pixData.holder); alert('Salvo!'); }}>Salvar Pix</button>
                </div>
              </div>
           </div>
        )}

        {isGiftModalOpen && (
          <div className="adm-modal-overlay" onClick={() => setIsGiftModalOpen(false)}>
            <div className="adm-modal-content" onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header"><h3>Inserir Presente</h3><button className="adm-close-btn" onClick={() => setIsGiftModalOpen(false)}><X size={20} /></button></div>
              <div className="adm-modal-body">
                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   await api.addGift({ title: giftTitle, subtitle: giftSubtitle, brand: giftBrand, category: giftCategory, price: parseFloat(giftPrice) || 0, imageUrl: giftImageUrl, buyUrl: giftBuyUrl, isFeatured });
                   setIsGiftModalOpen(false); loadAll();
                 }} style={{ display: 'grid', gap: '1.2rem' }}>
                    <div className="adm-form-field"><label>Título</label><input className="adm-login-input" value={giftTitle} onChange={e => setGiftTitle(e.target.value)} required /></div>
                    <div className="adm-form-field"><label>Preço</label><input className="adm-login-input" value={giftPrice} onChange={e => setGiftPrice(e.target.value)} required /></div>
                    <div className="adm-form-field"><label>URL Imagem</label><input className="adm-login-input" value={giftImageUrl} onChange={e => setGiftImageUrl(e.target.value)} required /></div>
                    <button className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }}>Salvar</button>
                 </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
