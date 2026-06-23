import React, { createContext, useContext, useState, useEffect } from 'react';
import { City, Language } from './types';
import { PAKISTANI_CITIES } from './constants';
import { StarField } from './components/StarField';
import { Nav } from './components/Nav';
import { Calendar } from './pages/Calendar';
import { CanISeeIt } from './pages/CanISeeIt';
import { AnimatePresence, motion } from 'framer-motion';

interface AppContextType {
  city: City;
  setCity: (city: City) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default function App() {
  const [city, setCity] = useState<City>(() => {
    const saved = localStorage.getItem('skypak-city');
    return PAKISTANI_CITIES.find(c => c.id === saved) || PAKISTANI_CITIES[0];
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('skypak-lang') as Language) || 'en';
  });
  const [currentPage, setCurrentPage] = useState('calendar');

  useEffect(() => { localStorage.setItem('skypak-city', city.id); }, [city]);
  useEffect(() => { localStorage.setItem('skypak-lang', lang); }, [lang]);

  const renderPage = () => {
    switch (currentPage) {
      case 'calendar': return <Calendar />;
      case 'can-i-see-it': return <CanISeeIt />;
      default: return <Calendar />;
    }
  };

  return (
    <AppContext.Provider value={{ city, setCity, lang, setLang, currentPage, setCurrentPage }}>
      <div className={`min-h-screen selection:bg-blue-500/30 ${lang === 'ur' ? 'rtl' : ''}`}>
        <StarField />
        <header className="fixed top-6 left-0 right-0 z-40 px-4 md:px-8 py-4 bg-transparent">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 glass py-4 px-6 md:px-10 border-white/5 shadow-[0_0_50px_rgba(56,103,214,0.15)]">
            <div className="flex items-center gap-3 self-start md:self-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(254,211,48,0.4)] shrink-0">
                <span className="text-black text-lg md:text-xl">☀️</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                SkyPak
              </h1>
            </div>
            <Nav />
          </div>
        </header>

        <main className="pt-56 md:pt-40 pb-40 px-4 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-40 px-8 py-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-t border-white/5 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">
          <span>© 2026 SkyPak</span>
          <span className="text-white/50">
            {new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })} PKT — {city.name}
          </span>
        </footer>
      </div>
    </AppContext.Provider>
  );
}
