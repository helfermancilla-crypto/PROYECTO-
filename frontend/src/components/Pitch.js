import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useTeam } from '../context/TeamContext';
import { cn } from '@/lib/utils';
import { Shirt } from 'lucide-react';

const PlayerToken = ({ player, onDoubleClick, bounds }) => {
  const { updatePlayerPosition, pitchSettings } = useTeam();
  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    updatePlayerPosition(player.id, { x: data.x, y: data.y });
  };

  // Use the kit color from settings, or fallback to role-based if needed (but user wants "design similar" which usually implies uniform kits)
  // We will use the kitColor for the shirt fill.
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
          "absolute flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 w-20",
          "touch-none" 
        )}
      >
        <div className="relative w-14 h-14 flex items-center justify-center drop-shadow-lg filter">
          {/* Jersey Icon */}
          <Shirt 
            className="w-full h-full" 
            style={{ fill: kitColor, color: 'rgba(0,0,0,0.2)' }} // Stroke is dark transparent for depth
            strokeWidth={1.5}
          />
          
          {/* Player Number */}
          <span 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg font-mono"
            style={{ color: numberColor, textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}
          >
            {player.number}
          </span>

          {/* Role Indicator (Small dot) */}
          <div className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white shadow-sm",
            player.role === 'GK' ? 'bg-yellow-400' :
            player.role === 'DEF' ? 'bg-blue-500' :
            player.role === 'MID' ? 'bg-emerald-500' : 'bg-rose-500'
          )}></div>
        </div>

        {/* Name Tag */}
        <div className="mt-0.5 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase tracking-wider shadow-md whitespace-nowrap backdrop-blur-sm border border-white/10">
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
    const { color, texture } = pitchSettings;
    let baseColor = '';
    let pattern = '';

    // Colors
    if (color === 'green') baseColor = 'bg-emerald-700';
    if (color === 'red') baseColor = 'bg-red-900';
    if (color === 'blue') baseColor = 'bg-slate-900';
    if (color === 'black') baseColor = 'bg-neutral-950';

    // Textures (using CSS gradients)
    if (texture === 'striped') {
      pattern = 'bg-[linear-gradient(90deg,rgba(0,0,0,0.05)_10%,transparent_10%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_60%,transparent_60%,transparent_100%)] bg-[length:100px_100px]';
    } else if (texture === 'checkered') {
      pattern = 'bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%,rgba(0,0,0,0.05)),linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.05)_75%,rgba(0,0,0,0.05))] bg-[length:60px_60px] bg-[position:0_0,30px_30px]';
    } else if (texture === 'plain') {
      pattern = '';
    }

    return `${baseColor} ${pattern}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      <div 
        id="soccer-pitch"
        ref={pitchRef}
        className={cn(
          "relative w-full max-w-5xl aspect-[2/3] md:aspect-[4/3] rounded-xl shadow-2xl border-[6px] border-white/10 overflow-hidden transition-all duration-500",
          getPitchBackground()
        )}
      >
        {/* Realistic Grass Texture Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] pointer-events-none mix-blend-overlay"></div>

        {/* Pitch Markings */}
        <div className="absolute inset-5 border-2 border-white/50 rounded-sm pointer-events-none opacity-80">
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50 -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/50 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Penalty Areas */}
          {/* Top */}
          <div className="absolute top-0 left-1/2 w-1/2 max-w-[300px] h-1/6 border-b-2 border-x-2 border-white/50 -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/2 w-1/4 max-w-[120px] h-[8%] border-b-2 border-x-2 border-white/50 -translate-x-1/2"></div>
          
          {/* Bottom */}
          <div className="absolute bottom-0 left-1/2 w-1/2 max-w-[300px] h-1/6 border-t-2 border-x-2 border-white/50 -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-1/4 max-w-[120px] h-[8%] border-t-2 border-x-2 border-white/50 -translate-x-1/2"></div>
          
          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl-full"></div>
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
