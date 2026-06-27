import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { AstronomyService } from '../services/astronomyService';
import { AstroEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Telescope, Eye, Moon, Zap, Circle, Star } from 'lucide-react';

const EVENT_META: Record<string, {
  description: string;
  equipment: string;
  equipmentBadge: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}> = {
  Eclipse: {
    description: "The Moon passes between Earth and the Sun, casting a shadow across Earth's surface. Never look directly without a solar filter.",
    equipment: 'Solar Filter Required',
    equipmentBadge: 'badge-red',
    icon: <Circle size={13} />,
    color: 'text-red-400',
    borderColor: 'border-l-red-500/70',
    accentBg: 'rgba(239,68,68,0.05)',
  },
  'Lunar Eclipse': {
    description: "Earth moves between the Sun and Moon, turning the Moon a deep blood red. Perfectly safe to view with naked eyes.",
    equipment: 'Naked Eye',
    equipmentBadge: 'badge-green',
    icon: <Moon size={13} />,
    color: 'text-orange-400',
    borderColor: 'border-l-orange-500/70',
    accentBg: 'rgba(249,115,22,0.05)',
  },
  'Meteor Shower': {
    description: "Earth passes through debris left by a comet. Dozens of shooting stars per hour streak across the sky — no equipment needed, just dark skies.",
    equipment: 'Naked Eye',
    equipmentBadge: 'badge-green',
    icon: <Zap size={13} />,
    color: 'text-purple-400',
    borderColor: 'border-l-purple-500/70',
    accentBg: 'rgba(168,85,247,0.05)',
  },
  Moon: {
    description: "The Moon reaches a key phase — either fully illuminated for a bright Full Moon, or completely dark for a New Moon perfect for deep sky viewing.",
    equipment: 'Naked Eye',
    equipmentBadge: 'badge-green',
    icon: <Moon size={13} />,
    color: 'text-blue-300',
    borderColor: 'border-l-blue-400/70',
    accentBg: 'rgba(147,197,253,0.04)',
  },
  Planet: {
    description: "A planet reaches an optimal position for viewing from Earth, appearing unusually bright and clear in the night sky.",
    equipment: 'Binoculars Recommended',
    equipmentBadge: 'badge-cyan',
    icon: <Star size={13} />,
    color: 'text-cyan-400',
    borderColor: 'border-l-cyan-500/70',
    accentBg: 'rgba(34,211,238,0.04)',
  },
  Other: {
    description: "A notable astronomical event worth watching from Pakistan's skies.",
    equipment: 'Naked Eye',
    equipmentBadge: 'badge-blue',
    icon: <Star size={13} />,
    color: 'text-white/40',
    borderColor: 'border-l-white/20',
    accentBg: 'rgba(255,255,255,0.02)',
  },
};

const getMeta = (event: AstroEvent) => {
  if (event.name.toLowerCase().includes('lunar eclipse')) return EVENT_META['Lunar Eclipse'];
  return EVENT_META[event.type] || EVENT_META['Other'];
};

export const Calendar: React.FC = () => {
  const { city, lang, navigateTo } = useApp();
  const astro = useMemo(() => new AstronomyService(city), [city]);
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    astro.getEventsForYear(new Date().getFullYear()).then(evts => {
      setEvents(evts.filter(e => e.date >= new Date()));
      setLoading(false);
    });
  }, [astro]);

  const filtered = useMemo(() => {
    if (filter === 'All') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  return (
    <div className="space-y-6 pb-8">
      <div className="pt-4 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-void-cyan/60">
          {city.name} · Pakistan · {new Date().getFullYear()}
        </p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          <span className="cosmic-text">Pakistan</span>{' '}
          <span className="text-white/80">Sky Events</span>
        </h1>
        <p className="text-white/30 text-sm pt-1">
          Tap <span className="text-celestial-blue font-bold">Navigate</span> on any event to find it in your sky
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Eclipse', 'Meteor Shower', 'Moon'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === f
                ? 'bg-celestial-blue border-celestial-blue text-white'
                : 'bg-white/4 border-white/8 text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-20 text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">
          Computing events for {city.name}...
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((event, idx) => {
            const meta = getMeta(event);
            const visColor = event.visibility === 'Excellent' ? 'badge-green' : event.visibility === 'Good' ? 'badge-gold' : 'badge-red';
            return (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.03 }}
                className={`event-card border-l-4 ${meta.borderColor}`}
                style={{ background: `linear-gradient(135deg, ${meta.accentBg} 0%, rgba(255,255,255,0.015) 100%)` }}
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="md:w-48 shrink-0">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={meta.color}>{meta.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/25">{event.type}</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stardust-gold/70 mb-1">
                        {format(event.date, 'MMM dd, yyyy')}
                      </p>
                      <h2 className="text-xl font-black uppercase leading-tight tracking-tight text-white">
                        {lang === 'ur' ? event.nameUrdu : event.name}
                      </h2>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mt-2">
                        Peak {format(event.peakTime, 'hh:mm aa')} PKT
                      </p>
                    </div>

                    <div className="flex-1 space-y-3">
                      <p className="text-white/45 text-sm leading-relaxed">{meta.description}</p>
                      <div className="text-[9px] font-black uppercase tracking-widest">
                        <span className="text-white/25">Best viewing · </span>
                        <span className="text-void-cyan">{format(event.startTime, 'hh:mm aa')} – {format(event.endTime, 'hh:mm aa')} PKT</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`badge ${visColor}`}><Eye size={7} /> {event.visibility}</span>
                        <span className={`badge ${meta.equipmentBadge}`}>{meta.equipment}</span>
                        <span className={`badge ${event.moonInterference ? 'badge-red' : 'badge-green'}`}>
                          <Moon size={7} /> {event.moonInterference ? 'Moon interference' : 'Dark sky'}
                        </span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                          <span>Max height</span>
                          <span className={meta.color}>{event.height}°</span>
                        </div>
                        <div className="w-full h-px bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, (event.height / 90) * 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.03 }}
                            className="h-full bg-gradient-to-r from-celestial-blue to-nebula-purple"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center justify-end border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5 shrink-0">
                      <button
                        onClick={() => navigateTo('can-i-see-it', event)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-celestial-blue/10 hover:bg-celestial-blue/25 border border-celestial-blue/25 hover:border-celestial-blue/50 text-celestial-blue group"
                      >
                        <Telescope size={13} className="group-hover:scale-110 transition-transform" />
                        Navigate
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/15 text-xs font-black uppercase tracking-widest">
            No events found
          </div>
        )}
      </div>
    </div>
  );
};
