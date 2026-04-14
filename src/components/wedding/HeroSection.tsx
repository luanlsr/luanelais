import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section id="inicio" className="hero-overhaul">
      <div className="hero-bg-liquid" />
      
      <motion.div style={{ opacity }} className="hero-content-premium">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-overline"
        >
          07 . 11 . 2026
        </motion.span>
        
        <div className="hero-names-wrap">
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            Luan
          </motion.h1>
          <span className="hero-ampersand-luxury">&</span>
          <motion.h1 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            Laís
          </motion.h1>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
          className="hero-quote"
        >
          "Aonde fores, irei. Onde pousares, pousarei."
        </motion.div>
      </motion.div>

      <motion.div 
        style={{ y: y1 }}
        className="hero-scroll-invite"
      >
        <div className="scroll-line" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
