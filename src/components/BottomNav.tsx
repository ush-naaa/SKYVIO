import React from 'react';
import { useApp } from '../App';
import { CalendarDays, Telescope } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
  const { currentPage, setCurrentPage, lang } = useApp();

  const items = [
    { id: 'calendar', icon: <CalendarDays size={16} />, label: 'Events', ur: 'واقعات' },
    { id: 'can-i-see-it', icon: <Telescope size={16} />, label: 'Navigate', ur: 'راستہ' },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass-strong flex items-center p-1 gap-1 rounded-2xl border border-white/10 shadow-xl">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
            currentPage === item.id ? 'text-white' : 'text-white/30 hover:text-white/60'
          }`}
        >
          {currentPage === item.id && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-celestial-blue/25 border border-celestial-blue/40 rounded-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.icon}
            {lang === 'ur' ? item.ur : item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
