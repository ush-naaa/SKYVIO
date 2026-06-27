import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { PAKISTANI_CITIES } from '../constants';
import { MapPin, ChevronDown, X } from 'lucide-react';

export const CityOrb: React.FC = () => {
  const { city, setCity, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all"
      >
        <MapPin size={12} className="text-void-cyan shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
          {lang === 'ur' ? city.nameUrdu : city.name}
        </span>
        <ChevronDown size={11} className={`text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 glass-strong rounded-2xl border border-white/10 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {lang === 'ur' ? 'شہر منتخب کریں' : 'Select City'}
              </span>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                <X size={12} />
              </button>
            </div>
            <div className="p-2 max-h-72 overflow-y-auto">
              {PAKISTANI_CITIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setCity(c); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    city.id === c.id
                      ? 'bg-celestial-blue/20 border border-celestial-blue/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin size={11} className={city.id === c.id ? 'text-celestial-blue' : 'text-white/20'} />
                    <div>
                      <div className={`text-[11px] font-black uppercase tracking-wide ${city.id === c.id ? 'text-white' : 'text-white/60'}`}>
                        {lang === 'ur' ? c.nameUrdu : c.name}
                      </div>
                      <div className="text-[9px] text-white/25 font-mono">{c.lat.toFixed(2)}°N {c.lng.toFixed(2)}°E</div>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${
                    c.pollution === 'Low' ? 'text-green-400' : c.pollution === 'Moderate' ? 'text-yellow-400' : 'text-red-400/60'
                  }`}>
                    {c.pollution === 'Low' ? '★ Clear' : c.pollution === 'Moderate' ? '◎ Mid' : '● Hazy'}
                  </span>
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-white/5 text-[8px] font-black uppercase tracking-widest text-white/15 text-center">
              Sky clarity based on light pollution
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
