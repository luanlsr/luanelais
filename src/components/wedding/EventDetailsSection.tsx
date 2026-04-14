import React from 'react';
import { Clock, Camera } from 'lucide-react';

const EventDetailsSection: React.FC = () => {
  return (
    <section id="evento" className="details-section reveal">
      <div className="container">
        <h2 className="section-title">O Local</h2>
        <div className="card-luxury info-card">
          <div className="location-info">
            <h3 className="location-name">Porttal do Lago</h3>
            <p className="location-city">Guararapes - SP</p>
            <div className="time-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', opacity: 0.6 }}>
              <Clock size={18} />
              <span>17:00H - 07 DE NOVEMBRO DE 2026</span>
            </div>
          </div>
          
          <div className="map-embed" style={{ marginTop: '3rem' }}>
            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1d3714.7570!2d-50.6409641!3d-21.3995879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x949605658e878517%3A0xed0176c12d8a6358!2sPorttal%20do%20Lago!5e0!3m2!1spt-BR!2sbr!4v1713025000000!5m2!1spt-BR!2sbr" 
               width="100%" 
               height="350" 
               style={{ border: 0 }} 
               allowFullScreen={true} 
               loading="lazy" 
             ></iframe>
          </div>
          
          <div className="airport-tip" style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={14} />
            <span>Aeroporto mais próximo: Araçatuba (ARU) - 25km</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
