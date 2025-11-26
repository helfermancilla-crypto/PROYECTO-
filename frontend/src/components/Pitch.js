import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { useTeam } from '../context/TeamContext';
import { cn } from '@/lib/utils';
import { User, Shirt } from 'lucide-react';

const PlayerToken = ({ player, onDoubleClick, bounds }) => {
  const { updatePlayerPosition } = useTeam();
  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    updatePlayerPosition(player.id, { x: data.x, y: data.y });
  };

  // Determine color class based on role or custom logic
  const getRoleColor = () => {
    if (player.role === 'GK') return 'bg-yellow-500 border-yellow-300';
    if (player.role === 'DEF') return 'bg-blue-600 border-blue-400';
    if (player.role === 'MID') return 'bg-emerald-600 border-emerald-400';
    if (player.role === 'FWD') return 'bg-rose-600 border-rose-400';
    return 'bg-slate-700 border-slate-500';
  };

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
          "absolute flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10 w-16",
          "touch-none" // Important for mobile drag
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-full border-2 shadow-lg flex items-center justify-center overflow-hidden relative bg-slate-800",
          getRoleColor()
        )}>
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">{player.number}</span>
          )}
        </div>
        <div className="mt-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase tracking-wider shadow-sm whitespace-nowrap backdrop-blur-sm border border-white/10">
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
      pattern = 'bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_10%,transparent_10%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_60%,transparent_60%,transparent_100%)] bg-[length:100px_100px]';
    } else if (texture === 'checkered') {
      pattern = 'bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)),linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1))] bg-[length:60px_60px] bg-[position:0_0,30px_30px]';
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
          "relative w-full max-w-5xl aspect-[2/3] md:aspect-[4/3] rounded-xl shadow-2xl border-4 border-white/20 overflow-hidden transition-all duration-500",
          getPitchBackground()
        )}
      >
        {/* Pitch Markings */}
        <div className="absolute inset-4 border-2 border-white/40 rounded-sm pointer-events-none">
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Penalty Areas (Simplified for responsiveness) */}
          {/* Top */}
          <div className="absolute top-0 left-1/2 w-1/2 h-1/6 border-b-2 border-x-2 border-white/40 -translate-x-1/2"></div>
          {/* Bottom */}
          <div className="absolute bottom-0 left-1/2 w-1/2 h-1/6 border-t-2 border-x-2 border-white/40 -translate-x-1/2"></div>
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
