import React from 'react';
import { Heart, MapPin, Gift, Users, List } from 'lucide-react';

interface BottomNavProps {
  onAdminClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onAdminClick }) => {
  const links = [
    { icon: <Heart size={20} />, label: 'Início', href: '#inicio' },
    { icon: <MapPin size={20} />, label: 'Local', href: '#evento' },
    { icon: <Gift size={20} />, label: 'Presentes', href: '#presentes' },
    { icon: <Users size={20} />, label: 'RSVP', href: '#rsvp' },
  ];

  return (
    <nav className="glass-nav">
      {links.map(link => (
        <a key={link.label} href={link.href} className="nav-tab">
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
      <button onClick={onAdminClick} className="nav-tab admin-tab">
        <List size={20} />
        <span>Gestão</span>
      </button>
    </nav>
  );
};

export default BottomNav;
