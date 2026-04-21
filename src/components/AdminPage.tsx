import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Key, Users, Gift, Trash2, Plus, Search, ExternalLink, Loader2, CheckCircle2, Phone, Mail, CreditCard, Hash } from 'lucide-react';
import { api, type Guest, type Gift as GiftType, type GuestCategory } from '../services/api';
import { generatePixPayload, maskPixKey, unmaskValue } from '../utils/pix';
import './AdminPage.css';

const ADMIN_USER = 'luanelais';
const ADMIN_PASS = '07112026';

type Tab = 'pix' | 'guests' | 'gifts';

const CATEGORY_LABELS: Record<GuestCategory, string> = {
  padrinho: 'Padrinhos / Madrinhas',
  familia_noiva: 'Família da Noiva',
  familia_noivo: 'Família do Noivo',
  convidado_noiva: 'Convidado da Noiva',
  convidado_noivo: 'Convidado do Noivo',
  outro: 'Outros'
};

const COUNTRIES = [
  { code: '55', flag: '🇧🇷', name: 'Brasil' },
  { code: '1', flag: '🇺🇸', name: 'EUA' },
  { code: '351', flag: '🇵🇹', name: 'Portugal' },
  { code: '44', flag: '🇬🇧', name: 'UK' },
  { code: '34', flag: '🇪🇸', name: 'Espanha' },
  { code: '33', flag: '🇫🇷', name: 'França' },
  { code: '39', flag: '🇮🇹', name: 'Itália' },
  { code: '49', flag: '🇩🇪', name: 'Alemanha' },
  { code: '54', flag: '🇦🇷', name: 'Argentina' },
];

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('guests');

  /* ── PIX ── */
  const [pixKey, setPixKey] = useState(() => api.getPixKey());
  const [pixType, setPixType] = useState(() => api.getPixType());
  const [pixPrefix, setPixPrefix] = useState('55');
  const [pixSaved, setPixSaved] = useState(false);

  /* ── GUESTS ── */
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newCategory, setNewCategory] = useState<GuestCategory>('convidado_noiva');
  const [newTotal, setNewTotal] = useState(1);

  /* ── GIFTS ── */
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [giftUrl, setGiftUrl] = useState('');
  const [giftTitle, setGiftTitle] = useState('');
  const [giftImage, setGiftImage] = useState('');
  const [giftPrice, setGiftPrice] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (authed) {
      loadGuests();
      loadGifts();
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  /* ── PIX handlers ── */
  const handleSavePix = () => {
    api.setPixKey(finalPixKey);
    api.setPixType(pixType);
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 2000);
  };

  const handlePixChange = (val: string) => {
    setPixKey(maskPixKey(val, pixType));
  };

  const finalPixKey = useMemo(() => {
    if (pixType === 'cell') {
      const clean = unmaskValue(pixKey);
      // Evitar duplicar prefixo se o usuário já digitou
      const body = clean.startsWith(pixPrefix) ? clean.substring(pixPrefix.length) : clean;
      return pixPrefix + body;
    }
    return unmaskValue(pixKey);
  }, [pixKey, pixPrefix, pixType]);

  /* ── GUEST handlers ── */
  const loadGuests = async () => {
    const all = await api.getAllGuestsForAdmin();
    setGuests(all);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGroup.trim()) return;
    await api.addGuest({ 
      name: newName.trim(), 
      group: newGroup.trim(), 
      confirmed: false, 
      totalGuests: newTotal,
      category: newCategory
    });
    setNewName('');
    setNewGroup('');
    setNewTotal(1);
    await loadGuests();
  };

  const handleRemoveGuest = async (id: string) => {
    if (!window.confirm('Remover este convidado?')) return;
    await api.removeGuest(id);
    await loadGuests();
  };

  /* ── GIFT handlers ── */
  const loadGifts = async () => {
    const all = await api.getGifts();
    setGifts(all);
  };

  const handleFetchUrl = async () => {
    if (!giftUrl.trim()) return;
    setFetching(true);
    try {
      const resp = await fetch(`https://api.microlink.io?url=${encodeURIComponent(giftUrl.trim())}`);
      const json = await resp.json();
      if (json.status === 'success' && json.data) {
        const d = json.data;
        if (d.title) setGiftTitle(d.title);
        if (d.image?.url) setGiftImage(d.image.url);
        if (d.price) {
          const raw = typeof d.price === 'object' ? d.price.amount : d.price;
          setGiftPrice(String(raw || ''));
        }
      }
    } catch {
      // silently fail — user can fill manually
    }
    setFetching(false);
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim()) return;
    await api.addGift({
      title: giftTitle.trim(),
      imageUrl: giftImage.trim(),
      price: parseFloat(giftPrice) || 0,
      buyUrl: giftUrl.trim(),
    });
    setGiftUrl('');
    setGiftTitle('');
    setGiftImage('');
    setGiftPrice('');
    await loadGifts();
  };

  const handleRemoveGift = async (id: string) => {
    if (!window.confirm('Remover este presente?')) return;
    await api.removeGift(id);
    await loadGifts();
  };

  const filteredGuests = guestSearch.trim()
    ? guests.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase()))
    : guests;

  const groupedGuests = useMemo(() => {
    const groups: Record<GuestCategory, Guest[]> = {
      padrinho: [],
      familia_noiva: [],
      familia_noivo: [],
      convidado_noiva: [],
      convidado_noivo: [],
      outro: []
    };
    filteredGuests.forEach(g => {
      groups[g.category || 'outro'].push(g);
    });
    return groups;
  }, [filteredGuests]);

  const stats = useMemo(() => {
    const total = guests.length;
    const confirmed = guests.filter(g => g.confirmed).length;
    return {
      total,
      confirmed,
      pending: total - confirmed
    };
  }, [guests]);

  const pixPayload = useMemo(() => {
    return generatePixPayload(finalPixKey);
  }, [finalPixKey]);

  /* ── LOGIN ── */
  if (!authed) {
    return (
      <div className="adm-login-wrap">
        <form className="adm-login-card" onSubmit={handleLogin}>
          <div className="adm-login-icon">🌿</div>
          <h1>Admin</h1>
          <p className="adm-login-sub">Painel Administrativo - L & L</p>
          <input
            type="text"
            placeholder="Usuário"
            value={loginUser}
            onChange={e => setLoginUser(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Senha"
            value={loginPass}
            onChange={e => setLoginPass(e.target.value)}
          />
          {loginError && <p className="adm-login-error">{loginError}</p>}
          <button type="submit" className="adm-btn-primary">Acessar Painel</button>
        </form>
      </div>
    );
  }

  /* ── PAINEL ── */
  return (
    <div className="adm-wrap">
      {/* Header */}
      <header className="adm-header">
        <div className="adm-header-left">
          <h1>L & L · Painel</h1>
        </div>
        <button className="adm-btn-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      {/* Tabs */}
      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'guests' ? 'active' : ''}`} onClick={() => setTab('guests')}>
          <Users size={18} /> Convidados
        </button>
        <button className={`adm-tab ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}>
          <Gift size={18} /> Presentes
        </button>
        <button className={`adm-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}>
          <Key size={18} /> Pix
        </button>
      </nav>

      {/* Content */}
      <main className="adm-content">

        {/* ─── GUESTS TAB ─── */}
        {tab === 'guests' && (
          <>
            <div className="adm-stats">
              <div className="adm-stat-card">
                <p className="adm-stat-label">Total de Convites</p>
                <p className="adm-stat-value">{stats.total}</p>
              </div>
              <div className="adm-stat-card">
                <p className="adm-stat-label">Confirmados</p>
                <p className="adm-stat-value" style={{ color: '#5d6d4a' }}>{stats.confirmed}</p>
              </div>
              <div className="adm-stat-card">
                <p className="adm-stat-label">Pendentes</p>
                <p className="adm-stat-value" style={{ color: '#c5a059' }}>{stats.pending}</p>
              </div>
            </div>

            <section className="adm-section">
              <h2>Novo Convidado</h2>
              <form className="adm-add-row" onSubmit={handleAddGuest}>
                <div>
                  <label className="adm-label">Nome Completo</label>
                  <input className="adm-input" placeholder="Ex: João Silva" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div>
                  <label className="adm-label">Grupo / Família</label>
                  <input className="adm-input" placeholder="Ex: Família Silva" value={newGroup} onChange={e => setNewGroup(e.target.value)} />
                </div>
                <div>
                  <label className="adm-label">Classificação</label>
                  <select className="adm-input" value={newCategory} onChange={e => setNewCategory(e.target.value as GuestCategory)}>
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="adm-label">Qtd</label>
                  <input className="adm-input" type="number" min={1} value={newTotal} onChange={e => setNewTotal(Number(e.target.value))} />
                </div>
                <button type="submit" className="adm-btn-primary"><Plus size={16} /> Add</button>
              </form>
            </section>

            <div className="adm-search-row">
              <Search size={18} />
              <input
                className="adm-input"
                placeholder="Buscar por nome do convidado..."
                value={guestSearch}
                onChange={e => setGuestSearch(e.target.value)}
              />
            </div>

            {Object.entries(groupedGuests).map(([cat, list]) => (
              list.length > 0 && (
                <div key={cat} className="adm-guest-group">
                  <h3 className="adm-group-header">
                    {CATEGORY_LABELS[cat as GuestCategory]} ({list.length})
                  </h3>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Grupo</th>
                          <th>Qtd</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map(g => (
                          <tr key={g.id}>
                            <td><strong>{g.name}</strong></td>
                            <td><span className="adm-category-badge">{g.group}</span></td>
                            <td>{g.totalGuests}</td>
                            <td>
                              <span className={`adm-badge ${g.confirmed ? 'confirmed' : 'pending'}`}>
                                {g.confirmed ? 'Confirmado' : 'Pendente'}
                              </span>
                            </td>
                            <td align="right">
                              <button className="adm-btn-icon" onClick={() => handleRemoveGuest(g.id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ))}
          </>
        )}

        {/* ─── GIFTS TAB ─── */}
        {tab === 'gifts' && (
          <>
            <section className="adm-section">
              <div className="adm-sec-header-compact">
                <Gift size={22} className="adm-olive" />
                <h2>Cadastrar Novo Presente</h2>
              </div>
              <p className="adm-desc">Preencha os dados abaixo para adicionar um item à lista pública.</p>
              
              <form className="adm-gift-form-v2" onSubmit={handleAddGift}>
                <div className="adm-form-grid">
                  <div className="adm-form-full">
                    <label className="adm-label-premium">Link do Produto (URL)</label>
                    <div className="adm-input-with-action">
                      <input
                        className="adm-input"
                        placeholder="Amazon, Mercado Livre, etc..."
                        value={giftUrl}
                        onChange={e => setGiftUrl(e.target.value)}
                      />
                      <button type="button" className="adm-btn-fetch" onClick={handleFetchUrl} disabled={fetching}>
                        {fetching ? <Loader2 size={14} className="adm-spin" /> : 'Sugerir Dados'}
                      </button>
                    </div>
                  </div>

                  <div className="adm-form-2col">
                    <div>
                      <label className="adm-label-premium">Título do Presente</label>
                      <input className="adm-input" placeholder="Ex: Jogo de Pratos" value={giftTitle} onChange={e => setGiftTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="adm-label-premium">Preço Sugerido (R$)</label>
                      <input className="adm-input" type="number" step="0.01" placeholder="0,00" value={giftPrice} onChange={e => setGiftPrice(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="adm-form-full">
                    <label className="adm-label-premium">URL da Imagem</label>
                    <input className="adm-input" placeholder="http://..." value={giftImage} onChange={e => setGiftImage(e.target.value)} />
                  </div>
                </div>

                <div className="adm-gift-preview-area">
                   {giftImage ? (
                     <div className="adm-gift-preview-card">
                       <img src={giftImage} alt="Preview" />
                       <div className="adm-preview-info">
                         <span className="adm-tag-preview">Preview</span>
                         <h4>{giftTitle || 'Título do Presente'}</h4>
                         <p>{giftPrice ? `R$ ${parseFloat(giftPrice).toFixed(2)}` : 'R$ 0,00'}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="adm-gift-placeholder-preview">
                       <Gift size={32} opacity={0.2} />
                       <p>Aguardando imagem...</p>
                     </div>
                   )}
                </div>

                <button type="submit" className="adm-btn-primary-lg" disabled={!giftTitle.trim()}>
                  <Plus size={18} /> Confirmar e Adicionar à Lista
                </button>
              </form>
            </section>

            <div className="adm-section">
              <h2 className="adm-h2-with-count">Itens na Lista <span>{gifts.length}</span></h2>
              <div className="adm-gift-list-grid">
                {gifts.map(g => (
                  <div key={g.id} className="adm-gift-item-card">
                    <div className="adm-gift-item-img">
                      {g.imageUrl ? <img src={g.imageUrl} alt={g.title} /> : <div className="adm-img-none"><Gift /></div>}
                    </div>
                    <div className="adm-gift-item-info">
                      <h4>{g.title}</h4>
                      <p>R$ {g.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <div className="adm-gift-item-actions">
                        {g.buyUrl && (
                          <a href={g.buyUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={12} /> Link
                          </a>
                        )}
                        <button className="adm-txt-danger" onClick={() => handleRemoveGift(g.id)}>
                          <Trash2 size={12} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {gifts.length === 0 && <p className="adm-empty">Sua lista de presentes está vazia.</p>}
              </div>
            </div>
          </>
        )}

        {/* ─── PIX TAB ─── */}
        {tab === 'pix' && (
          <section className="adm-section">
            <div className="adm-sec-header-compact">
              <CreditCard size={22} className="adm-olive" />
              <h2>Configuração do Pix</h2>
            </div>
            <p className="adm-desc">Defina a chave onde os noivos receberão os presentes em dinheiro.</p>
            
            <div className="adm-pix-config-card">
              <div className="adm-pix-types-grid">
                {[
                  { id: 'cell', label: 'Celular', icon: Phone },
                  { id: 'cpf', label: 'CPF', icon: Hash },
                  { id: 'cnpj', label: 'CNPJ', icon: CheckCircle2 },
                  { id: 'email', label: 'E-mail', icon: Mail },
                  { id: 'random', label: 'Chave Aleatória', icon: Key },
                ].map(t => (
                  <button 
                    key={t.id} 
                    className={`adm-pix-type-btn ${pixType === t.id ? 'active' : ''}`}
                    onClick={() => { setPixType(t.id); setPixKey(''); }}
                  >
                    <t.icon size={18} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="adm-pix-input-group">
                <label className="adm-label-premium">Chave Pix ({pixType.toUpperCase()})</label>
                <div className="adm-input-with-action">
                  {pixType === 'cell' && (
                    <div className="adm-prefix-select">
                      <select 
                        value={pixPrefix} 
                        onChange={e => setPixPrefix(e.target.value)}
                        className="adm-input"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.flag} +{c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <input
                    type="text"
                    value={pixKey}
                    onChange={e => handlePixChange(e.target.value)}
                    placeholder={
                      pixType === 'cell' ? '(00) 00000-0000' :
                      pixType === 'cpf' ? '000.000.000-00' :
                      pixType === 'cnpj' ? '00.000.000/0000-00' : 'Insira sua chave...'
                    }
                    className="adm-input-lg"
                  />
                  <button className="adm-btn-save-pix" onClick={handleSavePix}>
                    {pixSaved ? <CheckCircle2 size={18} /> : 'Salvar Alterações'}
                  </button>
                </div>
              </div>

              {pixKey && (
                <div className="adm-pix-result">
                  <div className="adm-pix-qr-area">
                  {pixPayload && (
                    <div className="adm-qr-white-bg" style={{ padding: '20px', background: '#fff' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`} 
                        alt="QR Code Pix"
                        width={220}
                        height={220}
                      />
                    </div>
                  )}
                  <p className="adm-qr-hint">QR CODE GERADO COM PAYLOAD ESTÁTICO (PADRÃO BANCO CENTRAL)</p>
                </div>
                  
                  <div className="adm-pix-preview-text">
                    <span className="adm-label-premium">Chave final (para o QR Code):</span>
                    <code className="adm-pix-code">+{pixType === 'cell' ? pixPrefix : ''}{unmaskValue(pixKey)}</code>
                    <p className="adm-pix-success-msg">Os aplicativos bancários reconhecerão este QR Code como uma transação Pix válida.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
