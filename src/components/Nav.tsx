import React from 'react';
import { useApp } from '../App';
import { CityOrb } from './CityOrb';

export const Nav: React.FC = () => {
  const { lang, setLang } = useApp();

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
        {(['en', 'ur'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 text-[9px] font-black transition-all uppercase tracking-widest ${
              lang === l ? 'bg-celestial-blue text-white' : 'text-white/30 hover:text-white/70'
            }`}
          >
            {l === 'en' ? 'EN' : 'اردو'}
          </button>
        ))}
      </div>
      <CityOrb />
    </div>
  );
};
