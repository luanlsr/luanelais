import React, { useState, useEffect } from 'react';
import { LogOut, Key, Users, Gift, Trash2, Plus, Search, ExternalLink, Loader2 } from 'lucide-react';
import { api, type Guest, type Gift as GiftType } from '../services/api';
import './AdminPage.css';

const ADMIN_USER = 'luanelais';
const ADMIN_PASS = '07112026';

type Tab = 'pix' | 'guests' | 'gifts';

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('pix');

  /* ── PIX ── */
  const [pixKey, setPixKey] = useState(() => api.getPixKey());
  const [pixSaved, setPixSaved] = useState(false);

  /* ── GUESTS ── */
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
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
    api.setPixKey(pixKey);
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 2000);
  };

  /* ── GUEST handlers ── */
  const loadGuests = async () => {
    const all = await api.getAllGuestsForAdmin();
    setGuests(all);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGroup.trim()) return;
    await api.addGuest({ name: newName.trim(), group: newGroup.trim(), confirmed: false, totalGuests: newTotal });
    setNewName('');
    setNewGroup('');
    setNewTotal(1);
    await loadGuests();
  };

  const handleRemoveGuest = async (id: string) => {
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
    await api.removeGift(id);
    await loadGifts();
  };

  const filteredGuests = guestSearch.trim()
    ? guests.filter(g => g.name.toLowerCase().includes(guestSearch.toLowerCase()))
    : guests;

  /* ── LOGIN ── */
  if (!authed) {
    return (
      <div className="adm-login-wrap">
        <form className="adm-login-card" onSubmit={handleLogin}>
          <div className="adm-login-icon">🔐</div>
          <h1>Área Administrativa</h1>
          <p className="adm-login-sub">Insira suas credenciais para acessar</p>
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
          <button type="submit" className="adm-btn-primary">Entrar</button>
        </form>
      </div>
    );
  }

  /* ── PAINEL ── */
  return (
    <div className="adm-wrap">
      {/* Header */}
      <header className="adm-header">
        <h1>Painel Admin</h1>
        <button className="adm-btn-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      {/* Tabs */}
      <nav className="adm-tabs">
        <button className={`adm-tab ${tab === 'pix' ? 'active' : ''}`} onClick={() => setTab('pix')}>
          <Key size={16} /> Pix
        </button>
        <button className={`adm-tab ${tab === 'guests' ? 'active' : ''}`} onClick={() => setTab('guests')}>
          <Users size={16} /> Convidados
        </button>
        <button className={`adm-tab ${tab === 'gifts' ? 'active' : ''}`} onClick={() => setTab('gifts')}>
          <Gift size={16} /> Presentes
        </button>
      </nav>

      {/* Content */}
      <main className="adm-content">

        {/* ─── PIX TAB ─── */}
        {tab === 'pix' && (
          <section className="adm-section">
            <h2>Chave Pix</h2>
            <p className="adm-desc">Configure a chave Pix exibida no convite. O QR Code é gerado automaticamente.</p>
            <div className="adm-pix-row">
              <input
                type="text"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="E-mail, CPF, telefone ou chave aleatória"
                className="adm-input"
              />
              <button className="adm-btn-primary" onClick={handleSavePix}>
                {pixSaved ? '✓ Salvo!' : 'Salvar'}
              </button>
            </div>
            {pixKey && (
              <div className="adm-pix-preview">
                <p className="adm-label">Preview do QR Code:</p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2D3820&bgcolor=fdfaf4&data=${encodeURIComponent(pixKey)}`}
                  alt="QR Code Preview"
                  width={200}
                  height={200}
                />
              </div>
            )}
          </section>
        )}

        {/* ─── GUESTS TAB ─── */}
        {tab === 'guests' && (
          <section className="adm-section">
            <h2>Convidados ({guests.length})</h2>

            {/* Add form */}
            <form className="adm-add-row" onSubmit={handleAddGuest}>
              <input className="adm-input" placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} />
              <input className="adm-input" placeholder="Grupo / Família" value={newGroup} onChange={e => setNewGroup(e.target.value)} />
              <input className="adm-input adm-input-sm" type="number" min={1} placeholder="Qtd" value={newTotal} onChange={e => setNewTotal(Number(e.target.value))} />
              <button type="submit" className="adm-btn-primary"><Plus size={16} /> Adicionar</button>
            </form>

            {/* Search */}
            <div className="adm-search-row">
              <Search size={14} />
              <input
                className="adm-input"
                placeholder="Buscar convidado..."
                value={guestSearch}
                onChange={e => setGuestSearch(e.target.value)}
              />
            </div>

            {/* Table */}
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
                  {filteredGuests.map(g => (
                    <tr key={g.id}>
                      <td>{g.name}</td>
                      <td>{g.group}</td>
                      <td>{g.totalGuests}</td>
                      <td>
                        <span className={`adm-badge ${g.confirmed ? 'confirmed' : 'pending'}`}>
                          {g.confirmed ? 'Confirmado' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <button className="adm-btn-icon" onClick={() => handleRemoveGuest(g.id)} title="Remover">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── GIFTS TAB ─── */}
        {tab === 'gifts' && (
          <section className="adm-section">
            <h2>Lista de Presentes ({gifts.length})</h2>
            <p className="adm-desc">Cole o link do produto e clique em "Buscar dados" para preencher automaticamente.</p>

            {/* Add form */}
            <form className="adm-gift-form" onSubmit={handleAddGift}>
              <div className="adm-gift-url-row">
                <input
                  className="adm-input"
                  placeholder="URL do produto (Amazon, Mercado Livre, etc.)"
                  value={giftUrl}
                  onChange={e => setGiftUrl(e.target.value)}
                />
                <button type="button" className="adm-btn-secondary" onClick={handleFetchUrl} disabled={fetching}>
                  {fetching ? <><Loader2 size={14} className="adm-spin" /> Buscando...</> : <><Search size={14} /> Buscar dados</>}
                </button>
              </div>

              <input className="adm-input" placeholder="Título do produto" value={giftTitle} onChange={e => setGiftTitle(e.target.value)} />
              <input className="adm-input" placeholder="URL da imagem" value={giftImage} onChange={e => setGiftImage(e.target.value)} />
              <input className="adm-input" placeholder="Valor (R$)" type="number" step="0.01" min="0" value={giftPrice} onChange={e => setGiftPrice(e.target.value)} />

              {giftImage && (
                <div className="adm-gift-preview">
                  <img src={giftImage} alt="Preview" />
                </div>
              )}

              <button type="submit" className="adm-btn-primary" disabled={!giftTitle.trim()}>
                <Plus size={16} /> Adicionar Presente
              </button>
            </form>

            {/* Gift list */}
            <div className="adm-gift-list">
              {gifts.map(g => (
                <div key={g.id} className="adm-gift-card">
                  {g.imageUrl && <img src={g.imageUrl} alt={g.title} className="adm-gift-img" />}
                  <div className="adm-gift-info">
                    <h4>{g.title}</h4>
                    {g.price > 0 && <p className="adm-gift-price">R$ {g.price.toFixed(2)}</p>}
                    {g.buyUrl && (
                      <a href={g.buyUrl} target="_blank" rel="noopener noreferrer" className="adm-gift-link">
                        <ExternalLink size={12} /> Ver produto
                      </a>
                    )}
                  </div>
                  <button className="adm-btn-icon" onClick={() => handleRemoveGift(g.id)} title="Remover">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {gifts.length === 0 && <p className="adm-empty">Nenhum presente cadastrado.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
