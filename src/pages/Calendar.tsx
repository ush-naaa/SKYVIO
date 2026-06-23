import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { AstronomyService } from '../services/astronomyService';
import { AstroEvent } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Bell, Share2, Zap } from 'lucide-react';

export const Calendar: React.FC = () => {
  const { city, lang } = useApp();
  const astro = useMemo(() => new AstronomyService(city), [city]);
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    astro.getEventsForYear(new Date().getFullYear()).then(setEvents);
  }, [astro]);

  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  const handleShare = (event: AstroEvent) => {
    const text = `${event.name} visible from ${city.name} on ${format(event.date, 'MMMM dd')} at ${format(event.peakTime, 'HH:mm')} PKT! #SkyPak #Pakistan`;
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const setReminder = (event: AstroEvent) => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          alert(`Reminder set for ${event.name}!`);
        }
      });
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Eclipse': return 'border-l-red-500/50';
      case 'Meteor Shower': return 'border-l-purple-500/50';
      case 'Planet': return 'border-l-blue-500/50';
      default: return 'border-l-white/30';
    }
  };

  const getVisibilityColor = (v: string) => {
    switch (v) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
          <CalendarIcon className="text-blue-400" />
          {lang === 'ur' ? 'فلکیاتی کیلنڈر' : 'Pakistan Sky Events 2026'}
        </h2>

        <div className="flex gap-2 overflow-x-auto py-2">
          {['All', 'Eclipse', 'Meteor Shower', 'Moon'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === f
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 opacity-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: idx * 0.03 }}
              className={`glass p-8 group hover:border-white/20 transition-all duration-500 border-l-4 ${getEventColor(event.type)}`}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-56 shrink-0">
                  <div className="text-yellow-400 text-[10px] font-black tracking-widest uppercase mb-3">
                    {format(event.date, 'MMMM dd, yyyy')}
                  </div>
                  <h3 className="text-3xl font-black uppercase leading-none tracking-tight group-hover:text-blue-400 transition-colors">
                    {lang === 'ur' ? event.nameUrdu : event.name}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest opacity-60">
                      {event.type}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest opacity-60">
                      {format(event.peakTime, 'HH:mm')} PKT
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9px] opacity-30 uppercase font-black block mb-2 tracking-widest">Visibility</span>
                      <span className={`text-xs font-black uppercase tracking-widest ${getVisibilityColor(event.visibility)}`}>
                        {event.visibility}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] opacity-30 uppercase font-black block mb-2 tracking-widest">Altitude</span>
                      <span className="text-xs font-black uppercase tracking-widest text-white/80">
                        {event.altitude}°
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] opacity-30 uppercase font-black block mb-2 tracking-widest">Direction</span>
                      <span className="text-xs font-black uppercase tracking-widest text-white/80">
                        {event.azimuth}°
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] opacity-30 uppercase font-black block mb-2 tracking-widest">Moon</span>
                      <span className={`text-xs font-black uppercase tracking-widest ${event.moonInterference ? 'text-red-400' : 'text-blue-400'}`}>
                        {event.moonInterference ? 'Interferes' : 'Clear'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(event.altitude / 90) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    />
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 justify-end border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 shrink-0">
                  <button onClick={() => setReminder(event)} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600/20 transition-all border border-white/5">
                    <Bell size={18} className="text-blue-400" />
                  </button>
                  <button onClick={() => handleShare(event)} className="p-3 bg-white/5 rounded-xl hover:bg-purple-600/20 transition-all border border-white/5">
                    <Share2 size={18} className="text-purple-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 text-white/30 text-sm font-black uppercase tracking-widest">
            No events found
          </div>
        )}
      </div>
    </div>
  );
};
