"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Photo = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  guest_image?: string;
  media_type?: string;
  likes: any[];
  comments: any[];
};

export default function SlideshowPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Agora exibindo 3 fotos por vez para maior destaque e sem cortes
  const PHOTOS_PER_PAGE = 3;

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Erro ao carregar slideshow:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  useEffect(() => {
    if (photos.length === 0) return;

    const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 12000); // 12 segundos para dar tempo de ver as 3 fotos

    return () => clearInterval(timer);
  }, [photos]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-wedding-gold font-serif text-2xl">
        Carregando Momentos...
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white font-serif text-xl p-8 text-center">
        Aguardando as fotos dos convidados para iniciar o slideshow...
      </div>
    );
  }

  const startIdx = currentPage * PHOTOS_PER_PAGE;
  const currentPhotos = photos.slice(startIdx, startIdx + PHOTOS_PER_PAGE);

  if (currentPhotos.length < PHOTOS_PER_PAGE && photos.length > PHOTOS_PER_PAGE) {
    const needed = PHOTOS_PER_PAGE - currentPhotos.length;
    currentPhotos.push(...photos.slice(0, needed));
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col p-6">
      <div className="h-16 flex justify-between items-center px-4 shrink-0 mb-4">
        <h1 className="text-wedding-gold font-serif text-3xl">Laís & Luan</h1>
        <div className="text-white/40 font-serif italic text-2xl">#CasamentoLaisELuan</div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            className="absolute inset-0 flex gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {currentPhotos.map((photo, index) => (
              <motion.div
                key={photo.id + index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="flex-1 relative rounded-3xl overflow-hidden bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col"
              >
                {/* Background blur para não ter faixas pretas vazias */}
                <div 
                  className="absolute inset-0 opacity-20 blur-xl scale-110"
                  style={{ 
                    backgroundImage: photo.media_type === 'video' ? 'none' : `url(${photo.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />

                <div className="relative flex-1 flex items-center justify-center p-2">
                  {photo.media_type === 'video' ? (
                    <video
                      src={photo.url}
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={photo.url}
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      alt="Evento"
                    />
                  )}
                </div>
                
                <div className="relative p-6 bg-gradient-to-t from-black/90 to-transparent shrink-0">
                  <div className="flex items-center gap-3">
                    {photo.guest_image ? (
                      <img src={photo.guest_image} className="w-10 h-10 rounded-full border-2 border-wedding-gold/30" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 bg-wedding-rose rounded-full flex items-center justify-center text-wedding-gold font-bold">
                        {photo.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-white font-serif text-xl block drop-shadow-md leading-tight">
                        {photo.name}
                      </span>
                      <span className="text-wedding-gold/60 text-[10px] uppercase tracking-widest">Convidado(a) Especial</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-1.5 w-full bg-white/5 mt-8 rounded-full overflow-hidden shrink-0">
        <motion.div 
          key={currentPage}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 12, ease: "linear" }}
          className="h-full bg-gradient-to-r from-wedding-gold/20 via-wedding-gold to-wedding-gold/20"
        />
      </div>
    </div>
  );
}
