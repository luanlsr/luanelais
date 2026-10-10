import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Heart, Image as ImageIcon, LogOut, MessageCircle, Send, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './PhotoReminderPage.css';

type Tab = 'feed' | 'gallery' | 'messages' | 'profile';
type Photo = { id: string; url: string; name: string; createdAt: string; likes: number; liked: boolean };
type Message = { id: string; name: string; text: string; createdAt: string };

const starterPhotos: Photo[] = Array.from({ length: 6 }, (_, index) => ({
  id: `starter-${index + 1}`,
  url: `/photo-reminder/image/login-${String(index + 1).padStart(2, '0')}.jpg`,
  name: index % 2 ? 'Mariana' : 'Rafael',
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  likes: index + 2,
  liked: false,
}));

const initialMessages: Message[] = [
  { id: 'message-1', name: 'Camila', text: 'Que dia lindo! Obrigada por dividir esse momento com a gente 🤍', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'message-2', name: 'Pedro', text: 'As fotos ficaram incríveis. Viva os noivos!', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

function readStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
}

export default function PhotoReminderPage() {
  const [entered, setEntered] = useState(() => localStorage.getItem('wedding-photo-entered') === 'yes');
  const [tab, setTab] = useState<Tab>('feed');
  const [photos, setPhotos] = useState<Photo[]>(() => readStorage('wedding-photos', starterPhotos));
  const [messages, setMessages] = useState<Message[]>(() => readStorage('wedding-messages', initialMessages));
  const [newMessage, setNewMessage] = useState('');
  const [selected, setSelected] = useState<Photo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('wedding-photos', JSON.stringify(photos)); }, [photos]);
  useEffect(() => { localStorage.setItem('wedding-messages', JSON.stringify(messages)); }, [messages]);

  const sortedItems = useMemo(() => [
    ...photos.map((photo) => ({ type: 'photo' as const, date: photo.createdAt, data: photo })),
    ...messages.map((message) => ({ type: 'message' as const, date: message.createdAt, data: message })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)), [photos, messages]);

  const enterAlbum = () => { localStorage.setItem('wedding-photo-entered', 'yes'); setEntered(true); };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => setPhotos((current) => [{ id: crypto.randomUUID(), url: String(reader.result), name: 'Você', createdAt: new Date().toISOString(), likes: 0, liked: false }, ...current]);
      reader.readAsDataURL(file);
    });
    setTab('gallery');
  };

  const toggleLike = (id: string) => setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, liked: !photo.liked, likes: photo.likes + (photo.liked ? -1 : 1) } : photo));

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((current) => [{ id: crypto.randomUUID(), name: 'Você', text: newMessage.trim(), createdAt: new Date().toISOString() }, ...current]);
    setNewMessage('');
  };

  if (!entered) return (
    <main className="photo-login">
      <div className="photo-login__collage" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <img key={index} src={`/photo-reminder/image/login-${String((index % 19) + 1).padStart(2, '0')}.jpg`} alt="" />)}</div>
      <div className="photo-login__shade" />
      <motion.section className="photo-login__card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="photo-eyebrow">Nosso álbum de memórias</span>
        <div className="photo-login__heart">♥</div>
        <h1>Laís <em>&</em> Luan</h1>
        <p>Um lugar para guardar cada instante</p>
        <div className="photo-divider"><span /> ♥ <span /></div>
        <small>Compartilhe suas fotos, deixe um recado e reviva a nossa história com todos os convidados.</small>
        <button className="photo-primary-button" onClick={enterAlbum}>Entrar no álbum <span>→</span></button>
        <small className="photo-login__hint">Área exclusiva para convidados</small>
      </motion.section>
    </main>
  );

  return (
    <main className="photo-app">
      <header className="photo-app__header"><div><span>Álbum de</span><h1>Laís & Luan</h1></div><button onClick={() => { localStorage.removeItem('wedding-photo-entered'); setEntered(false); }} aria-label="Sair"><LogOut size={18} /></button></header>
      <section className="photo-app__content">
        {tab === 'feed' && <div className="photo-feed"><div className="photo-welcome"><span>09.11.2026</span><h2>Momentos que ficam para sempre.</h2><p>Compartilhe a alegria desse dia com a gente.</p></div>{sortedItems.map((item) => item.type === 'photo' ? <PhotoCard key={item.data.id} photo={item.data} onLike={toggleLike} onOpen={setSelected} /> : <article className="message-card" key={item.data.id}><div className="message-avatar">{item.data.name[0]}</div><div><strong>{item.data.name}</strong><time>{new Date(item.data.createdAt).toLocaleDateString('pt-BR')}</time><p>{item.data.text}</p></div></article>)}</div>}
        {tab === 'gallery' && <div className="photo-gallery"><div className="photo-section-heading"><div><span>O álbum</span><h2>Todas as memórias</h2></div><button className="photo-upload-small" onClick={() => inputRef.current?.click()}><Camera size={17} /> Adicionar</button></div><div className="photo-grid">{photos.map((photo) => <button className="photo-grid__item" key={photo.id} onClick={() => setSelected(photo)}><img src={photo.url} alt={`Foto enviada por ${photo.name}`} /><span>{photo.name}</span></button>)}</div></div>}
        {tab === 'messages' && <div className="photo-messages"><div className="photo-section-heading"><div><span>Livro de visitas</span><h2>Recados para nós</h2></div><MessageCircle size={28} /></div><form className="message-form" onSubmit={sendMessage}><textarea value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Escreva uma mensagem carinhosa..." rows={3} /><button className="photo-primary-button" type="submit">Enviar recado <Send size={16} /></button></form>{messages.map((message) => <article className="message-card" key={message.id}><div className="message-avatar">{message.name[0]}</div><div><strong>{message.name}</strong><time>{new Date(message.createdAt).toLocaleDateString('pt-BR')}</time><p>{message.text}</p></div></article>)}</div>}
        {tab === 'profile' && <div className="photo-profile"><div className="profile-avatar"><User size={42} /></div><span>Convidado especial</span><h2>Que bom ter você aqui!</h2><p>Este álbum é um cantinho para reunir os registros mais bonitos do nosso casamento.</p><button className="photo-outline-button" onClick={() => { localStorage.removeItem('wedding-photo-entered'); setEntered(false); }}>Sair do álbum</button></div>}
      </section>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(event) => handleFiles(event.target.files)} />
      <nav className="photo-nav">{([['feed', 'Início', Heart], ['gallery', 'Galeria', ImageIcon], ['messages', 'Recados', MessageCircle], ['profile', 'Perfil', User]] as const).map(([key, label, Icon]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon size={20} /><span>{label}</span></button>)}<button className="photo-nav__upload" onClick={() => inputRef.current?.click()}><Camera size={22} /></button></nav>
      {selected && <div className="photo-lightbox" onClick={() => setSelected(null)}><button onClick={() => setSelected(null)} aria-label="Fechar"><X /></button><img src={selected.url} alt="Foto ampliada" onClick={(event) => event.stopPropagation()} /><p>{selected.name} · {selected.likes} curtidas</p></div>}
    </main>
  );
}

function PhotoCard({ photo, onLike, onOpen }: { photo: Photo; onLike: (id: string) => void; onOpen: (photo: Photo) => void }) {
  return <article className="photo-card"><div className="photo-card__meta"><div className="message-avatar">{photo.name[0]}</div><div><strong>{photo.name}</strong><time>{new Date(photo.createdAt).toLocaleDateString('pt-BR')}</time></div></div><button className="photo-card__image" onClick={() => onOpen(photo)}><img src={photo.url} alt="Momento do casamento" /></button><div className="photo-card__actions"><button onClick={() => onLike(photo.id)} className={photo.liked ? 'liked' : ''}><Heart size={20} fill={photo.liked ? 'currentColor' : 'none'} /> {photo.likes}</button><span><MessageCircle size={19} /> Memória compartilhada</span></div></article>;
}
