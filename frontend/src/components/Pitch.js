import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useTeam } from '../context/TeamContext';
import { cn } from '@/lib/utils';

// Realistic Jersey Component
const RealisticJersey = ({ color, numberColor, number, stripes }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md filter">
      <defs>
        <filter id="jersey-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
        </filter>
        <linearGradient id="jersey-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
      
      <g filter="url(#jersey-shadow)">
        {/* Base Shirt Shape */}
        <path 
          d="M20,25 L30,10 L40,15 L60,15 L70,10 L80,25 L75,35 L65,30 L65,85 L35,85 L35,30 L25,35 Z" 
          fill={color} 
          stroke="rgba(0,0,0,0.1)" 
          strokeWidth="1"
        />
        
        {/* Stripes Pattern (Optional) */}
        {stripes && (
          <path 
            d="M42,15 L42,85 M50,15 L50,85 M58,15 L58,85" 
            stroke="rgba(0,0,0,0.15)" 
            strokeWidth="4" 
            clipPath="url(#shirt-clip)"
          />
        )}

        {/* Collar */}
        <path d="M40,15 Q50,25 60,15" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
        
        {/* Gradient Overlay for 3D effect */}
        <path 
          d="M20,25 L30,10 L40,15 L60,15 L70,10 L80,25 L75,35 L65,30 L65,85 L35,85 L35,30 L25,35 Z" 
          fill="url(#jersey-gradient)" 
        />
      </g>

      {/* Number */}
      <text 
        x="50" 
        y="55" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fill={numberColor} 
        fontSize="28" 
        fontWeight="bold" 
        fontFamily="monospace"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {number}
      </text>
    </svg>
  );
};

const PlayerToken = ({ player, onDoubleClick, bounds }) => {
  const { updatePlayerPosition, pitchSettings } = useTeam();
  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    updatePlayerPosition(player.id, { x: data.x, y: data.y });
  };

  const kitColor = pitchSettings.kitColor || '#ef4444';
  const numberColor = pitchSettings.kitNumberColor || '#ffffff';

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={player.position}
      onStop={handleStop}
    >
      <div 
        ref={nodeRef}
        onDoubleClick={() => onDoubleClick(player)}
        className={cn(
          "absolute flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-20 w-24",
          "touch-none" 
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20 transition-all duration-300">
          <RealisticJersey 
            color={kitColor} 
            numberColor={numberColor} 
            number={player.number} 
            stripes={pitchSettings.texture === 'striped'}
          />
          
          {/* Role Indicator */}
          <div className={cn(
            "absolute top-0 right-2 w-3 h-3 rounded-full border border-white shadow-sm",
            player.role === 'GK' ? 'bg-yellow-400' :
            player.role === 'DEF' ? 'bg-blue-500' :
            player.role === 'MID' ? 'bg-emerald-500' : 'bg-rose-500'
          )}></div>
        </div>

        {/* Name Tag - Pill Style */}
        <div className="mt-[-5px] bg-black px-3 py-1 rounded-full text-[11px] text-white font-bold uppercase tracking-wider shadow-lg border border-white/20 min-w-[60px] text-center z-30">
          {player.nickname || player.name}
        </div>
      </div>
    </Draggable>
  );
};

const Pitch = ({ onPlayerClick }) => {
  const { players, pitchSettings } = useTeam();
  const pitchRef = useRef(null);

  const getPitchBackground = () => {
    const { color } = pitchSettings;
    // More realistic grass colors
    if (color === 'green') return 'bg-[#2d5a27]'; // Deep grass green
    if (color === 'red') return 'bg-[#4a1a1a]';
    if (color === 'blue') return 'bg-[#1a2a4a]';
    if (color === 'black') return 'bg-[#1a1a1a]';
    return 'bg-[#2d5a27]';
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden perspective-[1500px]">
      <div 
        id="soccer-pitch"
        ref={pitchRef}
        className={cn(
          "relative w-full max-w-4xl aspect-[3/4] md:aspect-[4/3] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-white/10 overflow-hidden transition-all duration-700 ease-in-out",
          getPitchBackground(),
          pitchSettings.viewMode === '3d' ? 'rotate-x-30 scale-95' : ''
        )}
        style={{
          transform: pitchSettings.viewMode === '3d' ? 'rotateX(25deg) scale(0.9)' : 'none',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Realistic Grass Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 50px,
                rgba(0,0,0,0.1) 50px,
                rgba(0,0,0,0.1) 100px
              ),
              url('https://www.transparenttextures.com/patterns/grass.png')
            `,
            backgroundSize: '100% 100%, auto'
          }}
        ></div>

        {/* Pitch Markings - Crisp White Lines */}
        <div className="absolute inset-6 border-[3px] border-white/70 rounded-sm pointer-events-none opacity-90">
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white/70 -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[3px] border-white/70 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Penalty Areas */}
          {/* Top */}
          <div className="absolute top-0 left-1/2 w-[40%] h-[16%] border-b-[3px] border-x-[3px] border-white/70 -translate-x-1/2 bg-white/5"></div>
          <div className="absolute top-0 left-1/2 w-[18%] h-[6%] border-b-[3px] border-x-[3px] border-white/70 -translate-x-1/2"></div>
          <div className="absolute top-[12%] left-1/2 w-16 h-8 border-b-[3px] border-white/70 rounded-b-full -translate-x-1/2"></div>
          
          {/* Bottom */}
          <div className="absolute bottom-0 left-1/2 w-[40%] h-[16%] border-t-[3px] border-x-[3px] border-white/70 -translate-x-1/2 bg-white/5"></div>
          <div className="absolute bottom-0 left-1/2 w-[18%] h-[6%] border-t-[3px] border-x-[3px] border-white/70 -translate-x-1/2"></div>
          <div className="absolute bottom-[12%] left-1/2 w-16 h-8 border-t-[3px] border-white/70 rounded-t-full -translate-x-1/2"></div>
          
          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white/70 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white/70 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white/70 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white/70 rounded-tl-full"></div>
        </div>

        {/* Players */}
        {players.map(player => (
          <PlayerToken 
            key={player.id} 
            player={player} 
            onDoubleClick={onPlayerClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default Pitch;
