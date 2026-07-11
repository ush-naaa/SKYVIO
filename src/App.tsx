import React, { createContext, useContext, useState, useEffect } from 'react';
import { City, Language, AstroEvent } from './types';
import { PAKISTANI_CITIES } from './constants';
import { SpaceBackground } from './components/SpaceBackground';
import { Nav } from './components/Nav';
import { BottomNav } from './components/BottomNav';
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
  selectedEvent: AstroEvent | null;
  setSelectedEvent: (event: AstroEvent | null) => void;
  navigateTo: (page: string, event?: AstroEvent) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export default function App() {
  const [city, setCity] = useState<City>(() => {
    const saved = localStorage.getItem('skyvio-city');
    return PAKISTANI_CITIES.find(c => c.id === saved) || PAKISTANI_CITIES[0];
  });
  const [lang, setLang] = useState<Language>(() =>
    (localStorage.getItem('skyvio-lang') as Language) || 'en'
  );
  const [currentPage, setCurrentPage] = useState('calendar');
  const [selectedEvent, setSelectedEvent] = useState<AstroEvent | null>(null);

  useEffect(() => { localStorage.setItem('skyvio-city', city.id); }, [city]);
  useEffect(() => { localStorage.setItem('skyvio-lang', lang); }, [lang]);

  const navigateTo = (page: string, event?: AstroEvent) => {
    if (event) setSelectedEvent(event);
    setCurrentPage(page);
  };

  return (
    <AppContext.Provider value={{
      city, setCity, lang, setLang,
      currentPage, setCurrentPage,
      selectedEvent, setSelectedEvent,
      navigateTo,
    }}>
      <div className={`min-h-screen relative ${lang === 'ur' ? 'rtl' : ''}`}>
        <SpaceBackground />

        {/* Header — logo + language + city */}
        <header className="fixed top-0 left-0 right-0 z-40 pt-3 pb-2">
          <div className="glass-strong flex items-center justify-between px-6 py-3 mx-4 rounded-2xl">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-full bg-celestial-blue/20 blur-sm" />
                <div className="absolute inset-1 rounded-full bg-space-void border border-celestial-blue/30 flex items-center justify-center">
                  <span className="text-sm">🌙</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase cosmic-text leading-none">Skyvio</h1>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20 leading-none">Pakistan Sky Guide</p>
              </div>
            </div>
            <Nav />
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-10 pt-24 pb-32 px-4 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {currentPage === 'calendar' && <Calendar />}
              {currentPage === 'can-i-see-it' && <CanISeeIt />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation — always at bottom, outside header */}
        <BottomNav />

        {/* PKT clock */}
        <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/15">
            {new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' })} · {city.name}
          </span>
        </div>
      </div>
    </AppContext.Provider>
  );
}
