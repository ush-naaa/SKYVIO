import React, { useMemo } from 'react';

export const SpaceBackground: React.FC = () => {
  const stars = useMemo(() => Array.from({ length: 160 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.4,
    duration: (Math.random() * 4 + 2).toFixed(1),
    delay: (Math.random() * 6).toFixed(1),
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
      <div style={{ position:'absolute', width:'55vw', height:'55vw', top:'-15%', left:'-10%', background:'radial-gradient(circle, rgba(56,103,214,0.12) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(60px)', animation:'nebula-pulse 9s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:'45vw', height:'45vw', top:'35%', right:'-10%', background:'radial-gradient(circle, rgba(136,84,208,0.09) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(60px)', animation:'nebula-pulse 11s ease-in-out infinite', animationDelay:'3s' }} />
      <div style={{ position:'absolute', width:'35vw', height:'35vw', bottom:'5%', left:'25%', background:'radial-gradient(circle, rgba(15,188,249,0.06) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(60px)', animation:'nebula-pulse 7s ease-in-out infinite', animationDelay:'5s' }} />
    </div>
  );
};
