import React from 'react';
import { Heart, MapPin, Gift, Users } from 'lucide-react';

const TopHeader: React.FC = () => {
  const links = [
    { icon: <Heart size={16} />, label: 'Início', href: '#inicio' },
    { icon: <MapPin size={16} />, label: 'O Evento', href: '#evento' },
    { icon: <Gift size={16} />, label: 'Presentes', href: '#presentes' },
    { icon: <Users size={16} />, label: 'RSVP', href: '#rsvp' },
  ];

  return (
    <header className="desktop-header">
      <div className="header-container">
        <div className="header-names-logo">
          <span>Luan</span>
          <span className="amp-serif">&</span>
          <span>Laís</span>
        </div>
        <nav className="header-nav">
          {links.map(link => (
            <a key={link.label} href={link.href} className="header-link">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default TopHeader;
