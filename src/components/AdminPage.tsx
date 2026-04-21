import React, { useState, useEffect, useMemo } from 'react';
import { LogOut, Key, Users, Gift, Trash2, Plus, Search, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { api, type Confirmation, type Gift as GiftType } from '../services/api';
import { generatePixPayload, maskPixKey, unmaskValue, maskPhone } from '../utils/pix';
import './AdminPage.css';

const ADMIN_USER = 'luanelais';
const ADMIN_PASS = '07112026';

type Tab = 'pix' | 'guests' | 'gifts';

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('guests');

  /* ── PIX ── */
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState('email');
  const [pixHolder, setPixHolder] = useState('');
  const [pixPrefix] = useState('55');
  const [pixSaved, setPixSaved] = useState(false);

  /* ── CONFIRMATIONS ── */
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [guestSearch, setGuestSearch] = useState('');

  /* ── GIFTS ── */
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [giftUrl, setGiftUrl] = useState('');
  const [giftTitle, setGiftTitle] = useState('');
  const [giftSubtitle, setGiftSubtitle] = useState('');
  const [giftBrand, setGiftBrand] = useState('');
  const [giftCategory, setGiftCategory] = useState('Outros');
  const [giftImage, setGiftImage] = useState('');
  const [giftPrice, setGiftPrice] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (authed) {
      loadConfirmations();
      loadGifts();
      loadPix();
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
  const loadPix = async () => {
    const data = await api.getPixData();
    setPixKey(data.key);
    setPixType(data.type);
    setPixHolder(data.holder);
  };

  const handleSavePix = async () => {
    await api.updatePixData(finalPixKey, pixType, pixHolder);
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 2000);
  };

  const handlePixChange = (val: string) => {
    setPixKey(maskPixKey(val, pixType));
  };

  const finalPixKey = useMemo(() => {
    if (pixType === 'cell') {
      const clean = unmaskValue(pixKey);
      const body = clean.startsWith(pixPrefix) ? clean.substring(pixPrefix.length) : clean;
      return pixPrefix + body;
    }
    return unmaskValue(pixKey);
  }, [pixKey, pixPrefix, pixType]);

  /* ── CONFIRMATION handlers ── */
  const loadConfirmations = async () => {
    const all = await api.getConfirmations();
    setConfirmations(all);
  };

  const handleRemoveConfirmation = async (id: string) => {
    if (!window.confirm('Remover esta confirmação?')) return;
    await api.removeConfirmation(id);
    await loadConfirmations();
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
        if (d.title) {
          const parts = d.title.split(/ - | \| /);
          setGiftTitle(parts[0]);
          if (parts.length > 1) setGiftSubtitle(parts.slice(1).join(' - '));
        }
        if (d.publisher) setGiftBrand(d.publisher);
        if (d.image?.url) setGiftImage(d.image.url);
        if (d.price) {
          const raw = typeof d.price === 'object' ? d.price.amount : d.price;
          setGiftPrice(String(raw || ''));
        }
      }
    } catch {
      // fail silently
    }
    setFetching(false);
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim()) return;
    await api.addGift({
      title: giftTitle.trim(),
      subtitle: giftSubtitle.trim(),
      brand: giftBrand.trim(),
      category: giftCategory,
      imageUrl: giftImage.trim(),
      price: parseFloat(giftPrice) || 0,
      buyUrl: giftUrl.trim(),
      isFeatured: isFeatured
    });
    setGiftUrl('');
    setGiftTitle('');
    setGiftSubtitle('');
    setGiftBrand('');
    setGiftCategory('Outros');
    setGiftImage('');
    setGiftPrice('');
    setIsFeatured(false);
    await loadGifts();
  };

  const handleRemoveGift = async (id: string) => {
    if (!window.confirm('Remover este presente?')) return;
    await api.removeGift(id);
    await loadGifts();
  };

  const filteredConfirmations = guestSearch.trim()
    ? confirmations.filter(c => c.fullName.toLowerCase().includes(guestSearch.toLowerCase()))
    : confirmations;

  const stats = useMemo(() => {
    let adults = confirmations.length;
    let kids = 0;
    confirmations.forEach(c => {
      kids += (c.children?.length || 0);
    });
    return {
      adults,
      kids,
      total: adults + kids
    };
  }, [confirmations]);

  const pixPayload = useMemo(() => {
    return generatePixPayload(finalPixKey);
  }, [finalPixKey]);

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

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <div className="adm-header-left">
          <h1>L & L · Painel</h1>
        </div>
        <button className="adm-btn-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'guests' ? 'active' : ''}`} onClick={() => setTab('guests')}>
          <Users size={18} /> Presenças
        </button>
        <button className={`adm-tab ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}>
          <Gift size={18} /> Presentes
        </button>
        <button className={`adm-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}>
          <Key size={18} /> Pix
        </button>
      </nav>

      <main className="adm-content">
        {tab === 'guests' && (
          <>
            <div className="adm-stats">
              <div className="adm-stat-card">
                <p className="adm-stat-label">Total Geral</p>
                <p className="adm-stat-value">{stats.total}</p>
              </div>
              <div className="adm-stat-card">
                <p className="adm-stat-label">Adultos</p>
                <p className="adm-stat-value" style={{ color: '#5d6d4a' }}>{stats.adults}</p>
              </div>
              <div className="adm-stat-card">
                <p className="adm-stat-label">Crianças</p>
                <p className="adm-stat-value" style={{ color: '#c5a059' }}>{stats.kids}</p>
              </div>
            </div>

            <div className="adm-search-row">
              <Search size={18} />
              <input
                className="adm-input"
                placeholder="Buscar por nome do convidado..."
                value={guestSearch}
                onChange={e => setGuestSearch(e.target.value)}
              />
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Convidado</th>
                    <th>Contato</th>
                    <th>Dependentes</th>
                    <th>Data</th>
                    <th align="right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConfirmations.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.fullName}</strong></td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <span style={{ opacity: 0.7 }}>{maskPhone(c.phone)}</span><br />
                          <span style={{ opacity: 0.5 }}>{c.email}</span>
                        </div>
                      </td>
                      <td>
                        {c.children && c.children.length > 0 ? (
                          <div className="adm-child-badges">
                            {c.children.map((child, i) => (
                              <span key={i} className="adm-child-badge">
                                {child.name} ({child.age}a)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ opacity: 0.3 }}>-</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </td>
                      <td align="right">
                        <button className="adm-btn-icon" onClick={() => handleRemoveConfirmation(c.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredConfirmations.length === 0 && (
                    <tr>
                      <td colSpan={5} align="center" style={{ padding: '3rem', opacity: 0.5 }}>
                        Nenhuma confirmação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'gifts' && (
          <>
            <section className="adm-section">
              <div className="adm-sec-header-compact">
                <Gift size={20} /> Cadastrar Novo Presente
              </div>
              <div className="adm-card-elevated">
                <div className="adm-form">
                  <div className="adm-form-full">
                    <label className="adm-label-premium">Link do Produto (Amazon, ML, etc)</label>
                    <div className="adm-input-group">
                      <input className="adm-input" value={giftUrl} onChange={e => setGiftUrl(e.target.value)} placeholder="https://..." />
                      <button className="adm-btn-accent" onClick={handleFetchUrl} disabled={fetching}>
                        {fetching ? <Loader2 size={18} className="animate-spin" /> : 'Puxar Dados'}
                      </button>
                    </div>
                  </div>
                  <div className="adm-form-2col">
                    <div>
                      <label className="adm-label-premium">Título Curto</label>
                      <input className="adm-input" value={giftTitle} onChange={e => setGiftTitle(e.target.value)} placeholder="Ex: Air Fryer" />
                    </div>
                    <div>
                      <label className="adm-label-premium">Subtítulo / Modelo</label>
                      <input className="adm-input" value={giftSubtitle} onChange={e => setGiftSubtitle(e.target.value)} placeholder="Ex: 5 em 1 12L" />
                    </div>
                  </div>
                  <div className="adm-form-3col">
                    <div>
                      <label className="adm-label-premium">Marca</label>
                      <input className="adm-input" value={giftBrand} onChange={e => setGiftBrand(e.target.value)} placeholder="Ex: Electrolux" />
                    </div>
                    <div>
                      <label className="adm-label-premium">Categoria</label>
                      <select className="adm-input" value={giftCategory} onChange={e => setGiftCategory(e.target.value)}>
                        <option value="Eletroportáteis">Eletroportáteis</option>
                        <option value="Cozinha">Cozinha</option>
                        <option value="Sala de Estar">Sala de Estar</option>
                        <option value="Quarto">Quarto</option>
                        <option value="Banheiro">Banheiro</option>
                        <option value="Decoração">Decoração</option>
                        <option value="Experiências">Experiências</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="adm-label-premium">Preço (R$)</label>
                      <input className="adm-input" type="number" step="0.01" value={giftPrice} onChange={e => setGiftPrice(e.target.value)} />
                    </div>
                  </div>
                  <div className="adm-form-row">
                    <label className="adm-label-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                      Destacar este produto (Badge de Sugestão)
                    </label>
                  </div>
                  <div className="adm-form-full">
                    <label className="adm-label-premium">URL da Imagem</label>
                    <input className="adm-input" value={giftImage} onChange={e => setGiftImage(e.target.value)} />
                  </div>
                  <button className="adm-btn-primary" onClick={handleAddGift} style={{ marginTop: '1.5rem' }}>
                    <Plus size={18} /> Salvar Presente
                  </button>
                </div>
              </div>
            </section>

            <section className="adm-section">
              <div className="adm-sec-header-compact">
                <Gift size={20} /> Lista Atual ({gifts.length})
              </div>
              <div className="adm-gift-grid">
                {gifts.map(g => (
                  <div key={g.id} className="adm-gift-item">
                    <img src={g.imageUrl} alt="" />
                    <div className="adm-gift-info">
                      <strong>{g.title}</strong>
                      <span>R$ {g.price.toFixed(2)}</span>
                    </div>
                    <button className="adm-btn-icon-red" onClick={() => handleRemoveGift(g.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'pix' && (
          <section className="adm-section">
            <div className="adm-sec-header-compact">
              <CreditCard size={20} /> Configuração do Pix para Presentes
            </div>
            <div className="adm-card-elevated" style={{ maxWidth: '600px' }}>
              <div className="adm-form">
                <div className="adm-form-2col">
                  <div>
                    <label className="adm-label-premium">Tipo de Chave</label>
                    <select className="adm-input" value={pixType} onChange={e => setPixType(e.target.value)}>
                      <option value="email">E-mail</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="cell">Celular</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="adm-label-premium">Titular da Conta</label>
                    <input className="adm-input" value={pixHolder} onChange={e => setPixHolder(e.target.value)} placeholder="Nome Completo" />
                  </div>
                </div>
                <div className="adm-form-full">
                  <label className="adm-label-premium">Chave Pix</label>
                  <input className="adm-input" value={pixKey} onChange={e => handlePixChange(e.target.value)} placeholder="Sua chave..." />
                </div>

                <div className="adm-pix-preview">
                  <p className="adm-label-premium" style={{ marginBottom: '1rem', opacity: 0.6 }}>Preview do QR Code</p>
                  <div className="adm-qr-container">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`} alt="QR Code" />
                  </div>
                </div>

                <button className="adm-btn-primary" onClick={handleSavePix} disabled={pixSaved}>
                  {pixSaved ? <><CheckCircle2 size={18} /> Salvo!</> : 'Salvar Configuração'}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
