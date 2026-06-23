import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { AstronomyService } from '../services/astronomyService';
import { AstroEvent } from '../types';
import { motion } from 'framer-motion';
import { Telescope, Navigation, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

const getCompassDirection = (azimuth: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(azimuth / 45) % 8];
};

const getVisibilityColor = (v: string) => {
  switch (v) {
    case 'Excellent': return 'text-green-400';
    case 'Good': return 'text-yellow-400';
    default: return 'text-red-400';
  }
};

export const CanISeeIt: React.FC = () => {
  const { city, lang } = useApp();
  const astro = useMemo(() => new AstronomyService(city), [city]);
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [selected, setSelected] = useState<AstroEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    astro.getEventsForYear(new Date().getFullYear()).then(evts => {
      const upcoming = evts.filter(e => e.date >= new Date());
      setEvents(upcoming);
      if (upcoming.length > 0) setSelected(upcoming[0]);
      setLoading(false);
    });
  }, [astro]);

  if (loading) return (
    <div className="text-center py-20 text-blue-400 font-black tracking-widest uppercase animate-pulse">
      Scanning sky for {city.name}...
    </div>
  );

  const isVisible = selected && selected.altitude > 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          {lang === 'ur' ? 'کیا میں اسے دیکھ سکتا ہوں؟' : 'Can I See It?'}
        </h2>
        <p className="text-white/30 text-xs uppercase tracking-widest font-black">
          Viewing from {city.name}, Pakistan
        </p>
      </div>

      {/* Event Selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
          Select an upcoming event
        </p>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {events.slice(0, 10).map(event => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                selected?.id === event.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <div>{lang === 'ur' ? event.nameUrdu : event.name}</div>
              <div className="opacity-60 mt-1">{format(event.date, 'MMM dd')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass p-10 rounded-3xl border-l-4 ${isVisible ? 'border-l-green-500' : 'border-l-red-500'}`}
        >
          {/* Visible / Not Visible */}
          <div className="flex items-center gap-4 mb-8">
            {isVisible
              ? <Eye size={32} className="text-green-400" />
              : <EyeOff size={32} className="text-red-400" />
            }
            <div>
              <h3 className={`text-4xl font-black uppercase tracking-tighter ${isVisible ? 'text-green-400' : 'text-red-400'}`}>
                {isVisible ? 'Visible' : 'Not Visible'}
              </h3>
              <p className="text-white/40 text-xs uppercase tracking-widest font-black mt-1">
                from {city.name} on {format(selected.date, 'MMMM dd, yyyy')} at {format(selected.peakTime, 'HH:mm')} PKT
              </p>
            </div>
          </div>

          {isVisible && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Altitude</p>
                <p className="text-2xl font-black text-white">{selected.altitude}°</p>
                <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">
                  {selected.altitude > 45 ? 'High — easy to see' : selected.altitude > 20 ? 'Moderate' : 'Low on horizon'}
                </p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Direction</p>
                <p className="text-2xl font-black text-white">{getCompassDirection(selected.azimuth)}</p>
                <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">{selected.azimuth}° azimuth</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Quality</p>
                <p className={`text-2xl font-black ${getVisibilityColor(selected.visibility)}`}>
                  {selected.visibility}
                </p>
                <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">viewing conditions</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Moon</p>
                <p className={`text-2xl font-black ${selected.moonInterference ? 'text-red-400' : 'text-green-400'}`}>
                  {selected.moonInterference ? 'Interferes' : 'Clear'}
                </p>
                <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest">lunar interference</p>
              </div>
            </div>
          )}

          {/* Where to look */}
          {isVisible && (
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-6 flex items-center gap-4">
              <Navigation size={24} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Where to look</p>
                <p className="text-white font-black text-sm">
                  Face <span className="text-blue-400">{getCompassDirection(selected.azimuth)}</span> and 
                  look <span className="text-blue-400">{selected.altitude}° above the horizon</span>.
                  {selected.altitude < 20 && ' Find an open area with a clear low horizon.'}
                  {selected.moonInterference && ' Light pollution from the moon may reduce visibility.'}
                </p>
              </div>
            </div>
          )}

          {!isVisible && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-6">
              <p className="text-white/60 text-sm font-black">
                This event will be below the horizon from {city.name} at peak time. 
                Try switching to a different city — it may be visible from other parts of Pakistan.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
