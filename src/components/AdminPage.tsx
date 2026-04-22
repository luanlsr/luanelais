import React, { useState, useEffect, useMemo } from 'react';
import { Users, Gift, Trash2, Plus, Search, CheckCircle2, Star, X, Check, LogOut, CreditCard, MessageCircle, Mail, Phone, Hash, AlertCircle } from 'lucide-react';
import { api, type Confirmation, type Gift as GiftType, type Category } from '../services/api';
import { maskPixKey, unmaskValue, maskPhone, maskCurrency, parseCurrency } from '../utils/pix';
import './AdminPage.css';

const ADMIN_USER = 'luanelais';
const ADMIN_PASS = '07112026';
const ITEMS_PER_PAGE = 15;

type Tab = 'pix' | 'guests' | 'gifts';

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [tab, setTab] = useState<Tab>('gifts');

  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pixData, setPixData] = useState({ key: '', type: 'email', holder: '' });

  const [guestSearch, setGuestSearch] = useState('');
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

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
    } else {
      showInfo('Acesso Negado', 'Usuário ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    showConfirm('Sair do Painel', 'Deseja realmente encerrar sua sessão?', () => {
      sessionStorage.removeItem('admin_auth');
      setAuthed(false);
      closeDialog();
    });
  };

  const openWhatsAppRemind = (id: string, phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
    const firstName = name.split(' ')[0];
    const message = encodeURIComponent(`Olá ${firstName}, tudo bem? Estamos muito felizes com a chegada do nosso casamento! 🥂\n\nPassando para confirmar se você e seus dependentes registrados ainda poderão comparecer no dia 07/11/2026.\n\nPoderia nos confirmar por aqui? Um abraço, de Luan & Laís.`);
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
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
          <button type="submit" className="adm-btn-submit" style={{ width: '100%', justifyContent: 'center' }}>Entrar no Painel</button>
        </form>
        {dialog.isOpen && <CustomDialog {...dialog} onClose={closeDialog} />}
      </div>
    );
  }

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <h1>L & L · Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="adm-btn-logout" onClick={() => setSentReminders([])}>Reset Checklist</button>
          <button className="adm-btn-logout" onClick={handleLogout}><LogOut size={14} /> Sair</button>
        </div>
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
              <div className="adm-stat-card"><span className="adm-stat-label">Total Pessoas</span><span className="adm-stat-value">{stats.total}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Adultos</span><span className="adm-stat-value">{stats.adults}</span></div>
              <div className="adm-stat-card"><span className="adm-stat-label">Crianças</span><span className="adm-stat-value">{stats.kids}</span></div>
            </div>

            <div className="adm-search-wrap">
              <Search size={22} />
              <input className="adm-search-input" placeholder="Pesquisar convidados..." value={guestSearch} onChange={e => setGuestSearch(e.target.value)} />
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
                          <h4 style={{ opacity: isSent ? 0.4 : 1 }}>{c.fullName}</h4>
                          {isSent && <button onClick={(e) => { e.stopPropagation(); setSentReminders(prev => prev.filter(id => id !== c.id)); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} color="#25D366" /></button>}
                        </div>
                        {c.children && c.children.length > 0 && <span style={{ opacity: isSent ? 0.3 : 1 }}>{1 + c.children.length} Pessoas</span>}
                      </div>
                      <div className="adm-row-actions" onClick={e => e.stopPropagation()}>
                        <button className="adm-btn-icon wa" style={{ background: isSent ? '#f0f0f0' : '#25D366' }} onClick={() => openWhatsAppRemind(c.id, c.phone, c.fullName)}>
                          <MessageCircle size={20} fill={isSent ? '#ccc' : 'white'} />
                        </button>
                        <button className="adm-btn-icon trash" onClick={() => showConfirm('Excluir Convidado', `Deseja realmente remover ${c.fullName}?`, () => { api.removeConfirmation(c.id).then(() => { loadAll(); closeDialog(); }); })}><Trash2 size={20} /></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="adm-row-detail" onClick={e => e.stopPropagation()}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <h3 style={{ margin: 0, fontWeight: 500, fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Presentes ({gifts.length})</h3>
              <button className="adm-btn-submit" onClick={() => setIsGiftModalOpen(true)}><Plus /> Novo</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {gifts.map(g => {
                const priceParts = formatPrice(g.price);
                return (
                  <div key={g.id} className={`gp-card ${g.isBought ? 'bought' : ''}`}>
                    {g.isFeatured && <div className="gp-badge"><Star size={10} fill="white" /> Sugestão dos Noivos</div>}
                    <div className="gp-card-img">
                      {g.imageUrl ? <img src={g.imageUrl} alt={g.title} /> : <Gift size={48} strokeWidth={0.5} opacity={0.2} />}
                    </div>
                    <div className="gp-card-body">
                      {g.brand && <span className="gp-card-brand">{g.brand}</span>}
                      <h3>{g.title}</h3>
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
                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', background: '#fee2e2', color: '#991b1b', border: 'none' }} 
                        onClick={() => showConfirm('Remover Presente', 'Deseja excluir este item da vitrine?', () => { api.removeGift(g.id).then(() => { loadAll(); closeDialog(); }); })}
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
            <div className="adm-modal-header"><h3>Novo Presente</h3><button className="adm-close-btn" onClick={() => setIsGiftModalOpen(false)}><X size={20} /></button></div>
            <div className="adm-modal-body">
              <form onSubmit={async (e) => {
                e.preventDefault();
                await api.addGift({
                  title: giftTitle,
                  subtitle: giftSubtitle,
                  brand: giftBrand,
                  category: giftCategory,
                  price: parseCurrency(giftPrice),
                  imageUrl: giftImageUrl,
                  buyUrl: giftBuyUrl,
                  isFeatured
                });
                setIsGiftModalOpen(false);
                // Limpar campos
                setGiftTitle('');
                setGiftSubtitle('');
                setGiftBrand('');
                setGiftCategory('');
                setGiftPrice('');
                setGiftImageUrl('');
                setGiftBuyUrl('');
                setIsFeatured(false);
                loadAll();
                showInfo('Feito!', 'Presente adicionado com sucesso.');
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
