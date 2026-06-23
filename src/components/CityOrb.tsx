import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { PAKISTANI_CITIES } from '../constants';
import { MapPin, X, Globe } from 'lucide-react';

export const CityOrb: React.FC = () => {
  const { city, setCity, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* The Orb Trigger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/10 transition-all group relative overflow-hidden celestial-border"
      >
        <div className="relative w-8 h-8">
           {/* Deep Space Core */}
           <div className="absolute inset-0 rounded-full bg-void-cyan opacity-20 blur-sm group-hover:blur-md transition-all animate-pulse" />
           <div className="absolute inset-1 rounded-full border border-celestial-blue/30 animate-[spin_10s_linear_infinite]" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Globe size={14} className="text-void-cyan" />
           </div>
        </div>
        
        <div className="text-left">
          <span className="block text-[7px] font-bold uppercase tracking-[0.2em] opacity-40">Observation Post</span>
          <span className="block text-[10px] font-black uppercase text-celestial-blue group-hover:text-white transition-colors">
            {lang === 'ur' ? city.nameUrdu : city.name}
          </span>
        </div>
      </motion.button>

      {/* Holographic Selection Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-space-void/90 backdrop-blur-xl z-[60]"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl z-[70] glass p-8 overflow-hidden rounded-3xl border-white/5 shadow-[0_0_100px_rgba(56,103,214,0.1)]"
            >
              <div className="relative z-20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-display font-black uppercase cosmic-text tracking-tighter">
                      {lang === 'ur' ? 'مقام منتخب کریں' : 'Select Location'}
                    </h3>
                    <p className="text-xs font-mono opacity-40 uppercase tracking-widest">Orbital Link: Active // Searching nodes...</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PAKISTANI_CITIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCity(c);
                        setIsOpen(false);
                      }}
                      className={`group relative p-5 border transition-all text-left overflow-hidden rounded-2xl ${
                        city.id === c.id 
                        ? 'bg-celestial-blue/20 border-celestial-blue shadow-[0_0_20px_rgba(56,103,214,0.2)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <MapPin size={14} className={city.id === c.id ? 'text-celestial-blue' : 'opacity-20'} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                          c.pollution === 'Low' ? 'text-stardust-gold' : 'opacity-20'
                        }`}>
                          {c.pollution === 'Low' ? 'CLEAR' : 'HAZY'}
                        </span>
                      </div>
                      <span className={`block text-base font-black tracking-tight ${city.id === c.id ? 'text-moon-white' : 'text-moon-white/60 group-hover:text-moon-white'}`}>
                        {lang === 'ur' ? c.nameUrdu : c.name}
                      </span>
                      <span className="block text-[10px] opacity-40 font-mono mt-1">
                        {c.lat.toFixed(2)}°N / {c.lng.toFixed(2)}°E
                      </span>
                      
                      {city.id === c.id && (
                        <motion.div 
                          layoutId="active-city"
                          className="absolute top-0 right-0 w-2 h-2 bg-celestial-blue shadow-[0_0_10px_#3867d6]" 
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-mono opacity-20 uppercase tracking-[0.4em]">
                   <span>Link secure</span>
                   <span>Ver 2.1.0</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
