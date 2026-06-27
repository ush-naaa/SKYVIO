import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../App';
import { AstronomyService } from '../services/astronomyService';
import { getSkyPosition, getBodyIdForEvent, SkyPosition } from '../services/astronomyApiService';
import { AstroEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const getDir = (az: number) => {
  if (isNaN(az)) return 'North';
  return ['North','Northeast','East','Southeast','South','Southwest','West','Northwest'][Math.round(az / 45) % 8];
};
const getDirShort = (az: number) => {
  if (isNaN(az)) return 'N';
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(az / 45) % 8];
};

const LiveCompass: React.FC<{ azimuth: number; altitude: number }> = ({ azimuth, altitude }) => {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    setIsIOS(ios);
    if (!ios) {
      const handler = (e: DeviceOrientationEvent) => {
        const h = e.alpha !== null ? 360 - e.alpha : null;
        if (h !== null) setHeading(Math.round(h));
      };
      window.addEventListener('deviceorientation', handler, true);
      return () => window.removeEventListener('deviceorientation', handler, true);
    }
  }, []);

  const requestIOSPermission = async () => {
    try {
      const result = await (DeviceOrientationEvent as any).requestPermission();
      if (result === 'granted') {
        const handler = (e: DeviceOrientationEvent) => {
          const h = (e as any).webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
          if (h !== null) setHeading(Math.round(h));
        };
        window.addEventListener('deviceorientation', handler, true);
      } else {
        setPermissionDenied(true);
      }
    } catch { setPermissionDenied(true); }
  };

  const safe = isNaN(azimuth) ? 0 : azimuth;
  const needleRotation = heading !== null ? safe - heading : safe;
  const dialRotation = heading !== null ? -heading : 0;
  const aligned = heading !== null && Math.abs(((safe - heading + 540) % 360) - 180) < 15;

  return (
    <div className="flex flex-col items-center gap-6">
      {isIOS && heading === null && !permissionDenied && (
        <button onClick={requestIOSPermission} className="px-5 py-2.5 bg-celestial-blue rounded-xl font-black uppercase tracking-widest text-xs">
          Tap to Enable Compass
        </button>
      )}
      {permissionDenied && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-black">
          <AlertCircle size={12} /> Settings → Safari → Motion & Orientation
        </div>
      )}

      {/* Big compass */}
      <div className="relative w-80 h-80">
        {/* Outer glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
          aligned
            ? 'shadow-[0_0_60px_rgba(74,222,128,0.4)] border-2 border-green-400'
            : 'shadow-[0_0_40px_rgba(56,103,214,0.2)] border-2 border-white/8'
        }`} />

        {/* Background */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle at center, rgba(56,103,214,0.08) 0%, rgba(0,0,0,0.4) 100%)',
        }} />

        {/* Rotating dial */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: dialRotation }}
          transition={{ type: 'spring', stiffness: 50, damping: 12 }}
        >
          {['N','NE','E','SE','S','SW','W','NW'].map((label, i) => {
            const angle = i * 45;
            const rad = (angle - 90) * (Math.PI / 180);
            const r = 130;
            const cx = 160;
            return (
              <div
                key={label}
                className={`absolute font-black -translate-x-1/2 -translate-y-1/2 ${
                  label === 'N' ? 'text-red-400 text-base' : 'text-white/35 text-xs'
                }`}
                style={{ left: cx + r * Math.cos(rad), top: cx + r * Math.sin(rad) }}
              >
                {label}
              </div>
            );
          })}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const isMajor = angle % 45 === 0;
            const isMid = angle % 15 === 0;
            return (
              <div key={i} className="absolute left-1/2 top-1/2 origin-top" style={{
                width: isMajor ? '2px' : '1px',
                height: isMajor ? '14px' : isMid ? '9px' : '5px',
                background: isMajor ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
                transform: `rotate(${angle}deg) translateX(-50%) translateY(-${143}px)`,
              }} />
            );
          })}
        </motion.div>

        {/* Needle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: needleRotation }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
        >
          <div className="relative flex flex-col items-center" style={{ height: 130 }}>
            <div className="w-0 h-0" style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '26px solid #60a5fa',
              filter: 'drop-shadow(0 0 10px rgba(96,165,250,0.9))',
            }} />
            <div className="w-2 flex-1 rounded-b-full" style={{
              background: 'linear-gradient(to bottom, #60a5fa, #3b6fd4)',
              boxShadow: '0 0 12px rgba(96,165,250,0.4)',
            }} />
          </div>
        </motion.div>

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.7)]" />
        </div>

        {/* Aligned message */}
        <AnimatePresence>
          {aligned && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-green-400 text-xs font-black uppercase tracking-widest whitespace-nowrap"
            >
              ✓ Aligned! Look up {altitude}°
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Direction instruction */}
      <div className="text-center space-y-1">
        <p className="text-white/30 text-xs uppercase tracking-widest font-black">Point your phone toward</p>
        <p className="text-3xl font-black text-white">{getDir(safe)}</p>
        <p className="text-white/40 text-sm">
          Then look <span className="text-blue-400 font-bold">{isNaN(altitude) ? 0 : altitude}°</span> above the horizon
          {' · '}
          <span className="text-white/30">
            {altitude < 20 ? 'near the ground' : altitude < 45 ? 'halfway up' : 'high up'}
          </span>
        </p>
      </div>

      {/* Altitude bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 mb-1.5">
          <span>Horizon</span>
          <span>Overhead</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, ((isNaN(altitude) ? 0 : altitude) / 90) * 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-celestial-blue to-nebula-purple rounded-full"
          />
        </div>
        <p className="text-center text-white/40 text-xs mt-2 font-black">
          {isNaN(altitude) ? 0 : altitude}° above the horizon
        </p>
      </div>

      {heading === null && !isIOS && (
        <p className="text-white/20 text-[10px] uppercase tracking-widest font-black animate-pulse">
          Slowly rotate your phone to calibrate...
        </p>
      )}
    </div>
  );
};

export const CanISeeIt: React.FC = () => {
  const { city, lang, selectedEvent } = useApp();
  const astro = useMemo(() => new AstronomyService(city), [city]);
  const [events, setEvents] = useState<AstroEvent[]>([]);
  const [selected, setSelected] = useState<AstroEvent | null>(selectedEvent);
  const [skyData, setSkyData] = useState<SkyPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [skyLoading, setSkyLoading] = useState(false);

  useEffect(() => {
    astro.getEventsForYear(new Date().getFullYear()).then(evts => {
      const upcoming = evts.filter(e => e.date >= new Date());
      setEvents(upcoming);
      if (!selectedEvent && upcoming.length > 0) setSelected(upcoming[0]);
      setLoading(false);
    });
  }, [astro]);

  useEffect(() => {
    if (selectedEvent) setSelected(selectedEvent);
  }, [selectedEvent]);

  useEffect(() => {
    if (!selected) return;
    setSkyLoading(true);
    setSkyData(null);
    const bodyId = getBodyIdForEvent(selected.type, selected.name);
    const viewTime = new Date(selected.peakTime);
    viewTime.setHours(21, 0, 0, 0);
    getSkyPosition(city, viewTime, bodyId).then(pos => {
      setSkyData(pos);
      setSkyLoading(false);
    });
  }, [selected, city]);

  if (loading) return (
    <div className="text-center py-20 text-celestial-blue font-black tracking-widest uppercase animate-pulse text-sm">
      Loading sky data for {city.name}...
    </div>
  );

  const safeAlt = skyData && !isNaN(skyData.altitude) ? skyData.altitude : 0;
  const safeAz = skyData && !isNaN(skyData.azimuth) ? skyData.azimuth : 0;
  const isVisible = skyData ? skyData.visible && safeAlt > 0 : false;

  return (
    <div className="space-y-6 pb-24">

      {/* Page title */}
      <div className="pt-4 space-y-1">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
          <span className="cosmic-text">Find It</span>{' '}
          <span className="text-white/80">In The Sky</span>
        </h1>
        <p className="text-white/30 text-sm">
          Select an event — we'll tell you if it's visible and where to look
        </p>
      </div>

      {/* Event selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {events.slice(0, 12).map(event => (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all ${
              selected?.id === event.id
                ? 'bg-celestial-blue border-celestial-blue text-white'
                : 'bg-white/4 border-white/8 text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
              {lang === 'ur' ? event.nameUrdu : event.name}
            </div>
            <div className="text-[8px] opacity-50 mt-0.5">{format(event.date, 'MMM dd')}</div>
          </button>
        ))}
      </div>

      {/* Sky loading */}
      {skyLoading && (
        <div className="text-center py-8 text-celestial-blue/60 font-black text-xs uppercase tracking-widest animate-pulse">
          Checking visibility for {city.name}...
        </div>
      )}

      {/* Main result */}
      {selected && skyData && !skyLoading && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Event hero */}
          <div className={`glass p-6 rounded-3xl border-l-4 ${isVisible ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  {lang === 'ur' ? selected.nameUrdu : selected.name}
                </h2>
                <p className="text-white/30 text-xs uppercase tracking-widest font-black mt-1">
                  {format(selected.date, 'MMMM dd, yyyy')} · {city.name}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${
                isVisible ? 'bg-green-400/15 text-green-400 border border-green-400/30' : 'bg-red-400/15 text-red-400 border border-red-400/30'
              }`}>
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                {isVisible ? 'Visible' : 'Not Visible'}
              </div>
            </div>
          </div>

          {/* Compass — center stage when visible */}
          {isVisible ? (
            <div className="glass p-8 rounded-3xl flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-6">
                Rotate your phone until the needle points straight up
              </p>
              <LiveCompass azimuth={safeAz} altitude={safeAlt} />
            </div>
          ) : (
            <div className="glass p-8 rounded-3xl text-center space-y-3">
              <EyeOff size={40} className="text-red-400/40 mx-auto" />
              <p className="text-white/50 text-sm leading-relaxed">
                <strong className="text-white">{selected.name}</strong> is below the horizon from {city.name} tonight.
              </p>
              <p className="text-white/30 text-sm">
                Try switching to <span className="text-yellow-400">Quetta</span> or <span className="text-yellow-400">Islamabad</span> — they often have clearer skies and better viewing angles.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
