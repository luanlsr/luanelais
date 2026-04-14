import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Envelope from './components/Envelope';
import LocalPage from './components/pages/LocalPage';
import RSVPPage from './components/pages/RSVPPage';
import GiftsPage from './components/pages/GiftsPage';
import './App.css';

type Page = 'local' | 'rsvp' | 'gifts' | null;

function App() {
  const [activePage, setActivePage] = useState<Page>(null);

  return (
    <div className="app-container">
      {/* The invitation card is always visible as the base layer */}
      <Envelope onNavigate={(page) => setActivePage(page)} />

      {/* Pages slide in on top of the invitation card */}
      <AnimatePresence>
        {activePage === 'local' && (
          <LocalPage key="local" onBack={() => setActivePage(null)} />
        )}
        {activePage === 'rsvp' && (
          <RSVPPage key="rsvp" onBack={() => setActivePage(null)} />
        )}
        {activePage === 'gifts' && (
          <GiftsPage key="gifts" onBack={() => setActivePage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
