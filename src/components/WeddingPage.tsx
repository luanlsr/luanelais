import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

// Components
import HeroSection from './wedding/HeroSection';
import CountdownSection from './wedding/CountdownSection';
import EventDetailsSection from './wedding/EventDetailsSection';
import TimelineSection from './wedding/TimelineSection';
import GiftsSection from './wedding/GiftsSection';
import RSVPSection from './wedding/RSVPSection';
import AdminModal from './wedding/AdminModal';
import BottomNav from './wedding/BottomNav';
import TopHeader from './wedding/TopHeader';
import './WeddingPage.css';

// Services
import { api, type Guest as APIGuest } from '../services/api';

const WeddingPage: React.FC = () => {
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'searching' | 'group' | 'loading' | 'success'>('idle');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [allGuests, setAllGuests] = useState<APIGuest[]>([]);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<APIGuest[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  // Stats for Admin
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });

  const refreshAdminData = async () => {
    const s = await api.getAdminStats();
    const g = await api.getAllGuestsForAdmin();
    setStats(s);
    setAllGuests(g);
  };

  useEffect(() => {
    const target = new Date('2026-11-07T17:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshAdminData();
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
    return () => reveals.forEach(reveal => observer.unobserve(reveal));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpStatus('searching');
    const found = await api.searchGuest(searchQuery);
    if (found) {
      const group = await api.getGroup(found.group);
      setSelectedGroup(group);
      setConfirmedIds(group.filter(g => g.confirmed).map(g => g.id));
      setRsvpStatus('group');
    } else {
      setRsvpStatus('idle');
      alert('Seu nome não foi encontrado na lista. Por favor, verifique a grafia ou entre em contato com os noivos.');
    }
  };

  const toggleMember = (id: string) => {
    setConfirmedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleConfirmFinal = async () => {
    setRsvpStatus('loading');
    try {
      await api.confirmRSVP(confirmedIds);
      setRsvpStatus('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#3a4531', '#c5a059', '#fbf9f4'] });
      refreshAdminData();
    } catch {
      setRsvpStatus('group');
      alert('Erro ao confirmar. Tente novamente.');
    }
  };

  return (
    <div className="wedding-page">
      <TopHeader />

      <HeroSection />
      
      <main className="page-content">
        <CountdownSection timeLeft={timeLeft} />
        
        <EventDetailsSection />
        
        <TimelineSection />

        <div className="section-rsvp">
          <RSVPSection 
            rsvpStatus={rsvpStatus} setRsvpStatus={setRsvpStatus}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            selectedGroup={selectedGroup} confirmedIds={confirmedIds}
            handleSearch={handleSearch} toggleMember={toggleMember}
            handleConfirmFinal={handleConfirmFinal}
          />
        </div>

        <GiftsSection />
      </main>

      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        guests={allGuests} 
        stats={stats}
      />
      
      <BottomNav onAdminClick={() => setIsAdminOpen(true)} />

      <footer className="page-footer">
        <div className="footer-names">
          <span>Luan</span>
          <span className="amp">&</span>
          <span>Laís</span>
        </div>
        <p>07.11.2026 • Porttal do Lago</p>
      </footer>
    </div>
  );
};

export default WeddingPage;
