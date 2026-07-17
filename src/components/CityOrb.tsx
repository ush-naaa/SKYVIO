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
    <>
      {/* Full screen overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-space-void/80 backdrop-blur-sm z-[90]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div ref={ref} className="relative z-[100]">
        {/* Trigger button — compact */}
        <button
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 border border-white/12 px-2.5 py-1.5 rounded-lg transition-all"
        >
          <MapPin size={10} className="text-void-cyan shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-wider text-white/80 max-w-[60px] truncate">
            {lang === 'ur' ? city.nameUrdu : city.name}
          </span>
          <ChevronDown
            size={9}
            className={`text-white/30 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/15 shadow-2xl z-[100] overflow-hidden"
              style={{ background: 'rgba(10, 12, 28, 0.97)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  {lang === 'ur' ? 'شہر منتخب کریں' : 'Select City'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                >
                  <X size={11} />
                </button>
              </div>

              {/* City list */}
              <div className="p-1.5 max-h-64 overflow-y-auto">
                {PAKISTANI_CITIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCity(c); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      city.id === c.id
                        ? 'bg-celestial-blue/25 border border-celestial-blue/40'
                        : 'hover:bg-white/6 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={10} className={city.id === c.id ? 'text-celestial-blue' : 'text-white/20'} />
                      <div>
                        <div className={`text-[11px] font-black uppercase tracking-wide ${city.id === c.id ? 'text-white' : 'text-white/60'}`}>
                          {lang === 'ur' ? c.nameUrdu : c.name}
                        </div>
                        <div className="text-[8px] text-white/20 font-mono">
                          {c.lat.toFixed(1)}°N {c.lng.toFixed(1)}°E
                        </div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                      c.pollution === 'Low' ? 'text-green-400' :
                      c.pollution === 'Moderate' ? 'text-yellow-400' : 'text-red-400/50'
                    }`}>
                      {c.pollution === 'Low' ? '★ Clear' : c.pollution === 'Moderate' ? '◎ Mid' : '● Hazy'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/5 text-[7px] font-black uppercase tracking-widest text-white/15 text-center">
                Based on light pollution data
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
