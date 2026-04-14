import React from 'react';

interface CountdownProps {
  timeLeft: { d: number, h: number, m: number, s: number };
}

const CountdownSection: React.FC<CountdownProps> = ({ timeLeft }) => {
  return (
    <section id="contagem" className="countdown-section reveal">
      <div className="container">
        <h2 className="section-title">Contagem Regressiva</h2>
        <div className="countdown-container">
          {[
            { label: 'Dias', value: timeLeft.d },
            { label: 'Horas', value: timeLeft.h },
            { label: 'Minutos', value: timeLeft.m },
            { label: 'Segundos', value: timeLeft.s },
          ].map((item) => (
            <div key={item.label} className="countdown-card">
              <span className="count-value">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="count-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;
