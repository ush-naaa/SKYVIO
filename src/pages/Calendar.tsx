import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../App';
import { AstronomyService } from '../services/astronomyService';
import { getSkyPosition, getBodyIdForEvent, SkyPosition } from '../services/astronomyApiService';
import { AstroEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Telescope, Moon, Zap, Circle, Star, ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { translations } from '../translations';

const getEventMeta = (event: AstroEvent, lang: 'en' | 'ur') => {
  const t = translations[lang];
  const isLunar = event.name.toLowerCase().includes('lunar eclipse');
  const base = {
    Eclipse: { desc: t.descEclipse, equipment: t.noEquipment, equipBadge: 'badge-red', icon: <Circle size={13} />, color: 'text-red-400', border: 'border-l-red-500/70', bg: 'rgba(239,68,68,0.05)', dot: '#f87171' },
    'Lunar Eclipse': { desc: t.descLunarEclipse, equipment: t.noEquipment, equipBadge: 'badge-green', icon: <Moon size={13} />, color: 'text-orange-400', border: 'border-l-orange-500/70', bg: 'rgba(249,115,22,0.05)', dot: '#fb923c' },
    'Meteor Shower': { desc: t.descMeteorShower, equipment: t.noEquipment, equipBadge: 'badge-green', icon: <Zap size={13} />, color: 'text-purple-400', border: 'border-l-purple-500/70', bg: 'rgba(168,85,247,0.05)', dot: '#c084fc' },
    Moon: { desc: t.descMoon, equipment: t.noEquipment, equipBadge: 'badge-green', icon: <Moon size={13} />, color: 'text-blue-300', border: 'border-l-blue-400/70', bg: 'rgba(147,197,253,0.04)', dot: '#93c5fd' },
    Planet: { desc: t.descPlanet, equipment: 'Binoculars', equipBadge: 'badge-cyan', icon: <Star size={13} />, color: 'text-cyan-400', border: 'border-l-cyan-500/70', bg: 'rgba(34,211,238,0.04)', dot: '#22d3ee' },
    Other: { desc: t.descOther, equipment: t.noEquipment, equipBadge: 'badge-blue', icon: <Star size={13} />, color: 'text-white/40', border: 'border-l-white/20', bg: 'rgba(255,255,255,0.02)', dot: '#ffffff40' },
  };
  if (isLunar) return base['Lunar Eclipse'];
  return base[event.type as keyof typeof base] || base['Other'];
};

const groupByMonth = (events: AstroEvent[]) => {
  const groups: Record<string, AstroEvent[]> = {};
  events.forEach(e => {
    const key = format(e.date, 'MMMM yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
};

export const Calendar: React.FC = () => {
  const { city, lang, navigateTo } = useApp();
  const t = translations[lang];
  const astro = useMemo(() => new AstronomyService(city), [city]);
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [skyCache, setSkyCache] = useState<Record<string, SkyPosition>>({});
  const [skyLoading, setSkyLoading] = useState<string | null>(null);
  const [skyError, setSkyError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    astro.getEventsForYear(new Date().getFullYear()).then(evts => {
      setEvents(evts.filter(e => e.date >= new Date()));
      setLoading(false);
    });
  }, [astro]);

  // Clear cache when city changes
  useEffect(() => {
    setSkyCache({});
    setExpanded(null);
  }, [city]);

  const fetchSkyData = useCallback(async (event: AstroEvent) => {
  if (skyCache[event.id]) return;
  setSkyLoading(event.id);
  try {
    const bodyId = getBodyIdForEvent(event.type, event.name);
    const viewTime = new Date(event.peakTime);
    viewTime.setHours(21, 0, 0, 0);
    const pos = await getSkyPosition(city, viewTime, bodyId);
    setSkyCache(prev => ({ ...prev, [event.id]: pos }));
  } catch {
    setSkyError(prev => ({ ...prev, [event.id]: true }));
  } finally {
    setSkyLoading(null);
  }
}, [skyCache, city]);
  const handleExpand = (event: AstroEvent) => {
    const isExpanding = expanded !== event.id;
    setExpanded(isExpanding ? event.id : null);
    if (isExpanding) fetchSkyData(event);
  };

  const filtered = useMemo(() => {
    if (filter === 'All') return events;
    if (filter === 'Eclipse') return events.filter(e => e.type === 'Eclipse');
    if (filter === 'Meteor Shower') return events.filter(e => e.type === 'Meteor Shower');
    if (filter === 'Moon') return events.filter(e => e.type === 'Moon');
    return events;
  }, [events, filter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const filters = [
    { key: 'All', label: t.all },
    { key: 'Eclipse', label: t.eclipse },
    { key: 'Meteor Shower', label: t.meteorShower },
    { key: 'Moon', label: t.moonFilter },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <div className="pt-4 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-void-cyan/60">
          {city.name} · Pakistan · {new Date().getFullYear()}
        </p>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          <span className="cosmic-text">{lang === 'ur' ? 'پاکستان' : 'Pakistan'}</span>{' '}
          <span className="text-white/80">{lang === 'ur' ? 'آسمانی واقعات' : 'Sky Events'}</span>
        </h1>
        <p className="text-white/30 text-sm pt-1">{t.eventsSubtitle}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === f.key
                ? 'bg-celestial-blue border-celestial-blue text-white'
                : 'bg-white/4 border-white/8 text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-20 text-white/20 text-xs font-black uppercase tracking-widest animate-pulse">
          {t.computingEvents} {city.name}...
        </div>
      )}

      {/* Month grouped events */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            {/* Month header */}
            <div className="flex items-center gap-3 mb-3 py-2">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3">
                {month}
              </span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {monthEvents.map((event, idx) => {
                  const meta = getEventMeta(event, lang);
                  const isExpanded = expanded === event.id;
                  const sky = skyCache[event.id];
                  const isLoadingSky = skyLoading === event.id;

                  return (
                    <motion.article
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`event-card border-l-4 ${meta.border}`}
                      style={{ background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(255,255,255,0.015) 100%)` }}
                    >
                      {/* Compact row — always visible */}
                      <div
                        className="p-4 cursor-pointer select-none"
                        onClick={() => handleExpand(event)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Color dot */}
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.dot, boxShadow: `0 0 8px ${meta.dot}` }} />

                          {/* Date */}
                          <p className="text-[9px] font-black uppercase tracking-widest text-stardust-gold/70 shrink-0 w-14">
                            {format(event.date, 'MMM dd')}
                          </p>

                          {/* Name + type */}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-black uppercase tracking-tight text-white truncate">
                              {lang === 'ur' ? event.nameUrdu : event.name}
                            </h2>
                            <p className="text-[9px] text-white/25 uppercase tracking-widest font-black">
                              {event.type} · {format(event.peakTime, 'hh:mm aa')}
                            </p>
                          </div>

                          {/* Moon interference dot */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {event.moonInterference && (
                              <span className="text-[8px] font-black text-yellow-400/60 uppercase tracking-widest hidden sm:block">
                                Moon
                              </span>
                            )}
                            <ChevronDown
                              size={12}
                              className={`text-white/20 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-5 border-t border-white/5 pt-4 space-y-4">

                              {/* Description */}
                              <p className="text-white/50 text-sm leading-relaxed">{meta.desc}</p>

                              {/* Viewing window */}
                              <div className="text-[9px] font-black uppercase tracking-widest">
                                <span className="text-white/25">{t.bestViewing} · </span>
                                <span className="text-void-cyan">
                                  {format(event.startTime, 'hh:mm aa')} – {format(event.endTime, 'hh:mm aa')}
                                </span>
                              </div>

                              {/* Static badges */}
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`badge ${meta.equipBadge}`}>{meta.equipment}</span>
                                <span className={`badge ${event.moonInterference ? 'badge-red' : 'badge-green'}`}>
                                  <Moon size={7} /> {event.moonInterference ? t.moonInterference : t.darkSky}
                                </span>
                              </div>

                              {/* Real visibility from API */}
                              <div className="rounded-2xl border border-white/8 overflow-hidden">
                                {isLoadingSky && (
                                  <div className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                                    <Loader2 size={12} className="animate-spin" />
                                    Checking visibility for {city.name}...
                                  </div>
                                )}

                                {skyError[event.id] && !isLoadingSky && (
                                  <div className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-400/40">
                                    <span>Could not fetch sky data. Try again later.</span>
                                  </div>
                                )}

                                {sky && !isLoadingSky && (
                                  <div className={`px-4 py-3 ${sky.visible ? 'bg-green-400/8' : 'bg-red-400/8'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      {sky.visible
                                        ? <Eye size={14} className="text-green-400" />
                                        : <EyeOff size={14} className="text-red-400" />
                                      }
                                      <span className={`text-xs font-black uppercase tracking-widest ${sky.visible ? 'text-green-400' : 'text-red-400'}`}>
                                        {sky.visible ? `Visible from ${city.name}` : `Not visible from ${city.name}`}
                                      </span>
                                    </div>
                                    {sky.visible && (
                                      <p className="text-white/40 text-xs">
                                        Face <span className="text-white font-bold">{sky.compassDirection}</span> · {sky.altitude}° above horizon
                                      </p>
                                    )}
                                    {!sky.visible && event.name === 'New Moon' && (
                                      <p className="text-white/40 text-xs">The New Moon is not visible — but tonight has the darkest sky of the month, perfect for stargazing.</p>
                                    )}
                                    {!sky.visible && event.name !== 'New Moon' && (
                                      <p className="text-white/40 text-xs">{sky.viewingTip}</p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Navigate button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); navigateTo('can-i-see-it', event); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-celestial-blue/15 hover:bg-celestial-blue/30 border border-celestial-blue/30 hover:border-celestial-blue/60 text-celestial-blue group"
                              >
                                <Telescope size={13} className="group-hover:scale-110 transition-transform" />
                                {t.navigate} →
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-white/15 text-xs font-black uppercase tracking-widest">
            No events found
          </div>
        )}
      </div>
    </div>
  );
};
