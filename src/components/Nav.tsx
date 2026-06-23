import React from 'react';
import { useApp } from '../App';
import { Telescope, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { CityOrb } from './CityOrb';

export const Nav: React.FC = () => {
  const { currentPage, setCurrentPage, lang, setLang } = useApp();

  const menuItems = [
    { id: 'calendar', icon: <CalendarIcon size={18} />, label: 'Events', labelUrdu: 'واقعات' },
    { id: 'can-i-see-it', icon: <Telescope size={18} />, label: 'Can I See It?', labelUrdu: 'دکھائی دے گا؟' },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <CityOrb />
        <div className="h-6 w-px bg-white/10 hidden md:block"></div>
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 shrink-0">
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ur')}
            className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all ${lang === 'ur' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            اردو
          </button>
        </div>
      </div>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass flex items-center p-1 rounded-2xl gap-0.5 z-50 shadow-2xl border border-white/10 bg-black/90 backdrop-blur-2xl justify-around overflow-hidden">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-1 py-3 px-8 rounded-xl transition-all duration-300 relative group ${
              currentPage === item.id ? 'text-blue-400' : 'text-white/30 hover:text-white'
            }`}
          >
            {currentPage === item.id && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-blue-600/10 rounded-xl -z-10"
              />
            )}
            <span className={`text-lg transition-transform duration-300 ${currentPage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {lang === 'ur' ? item.labelUrdu : item.label}
            </span>
            {currentPage === item.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
