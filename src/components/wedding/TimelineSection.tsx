import React from 'react';
import { Clock, Church, GlassWater, Utensils, Music } from 'lucide-react';

const TimelineSection: React.FC = () => {
  const schedule = [
    { time: '17:00h', title: 'Cerimônia Religiosa', icon: <Church size={20} /> },
    { time: '18:30h', title: 'Coquetel de Boas-vindas', icon: <GlassWater size={20} /> },
    { time: '20:00h', title: 'Jantar', icon: <Utensils size={20} /> },
    { time: '22:00h', title: 'Início da Festa', icon: <Music size={20} /> },
    { time: '04:00h', title: 'Encerramento', icon: <Clock size={20} /> }
  ];

  return (
    <section id="itinerario" className="timeline-section reveal">
      <h2 className="section-title">Itinerário</h2>
      <div className="timeline-wrapper">
        {schedule.map((item, i) => (
          <div key={i} className="timeline-node">
            <div className="node-marker">
              <div className="marker-icon">{item.icon}</div>
            </div>
            <div className="node-content">
              <span className="node-year">{item.time}</span>
              <h3>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TimelineSection;
