import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useTeam } from '../context/TeamContext';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const DraggableToken = ({ player, overall, onDoubleClick, updatePos }) => {
  const ref = useRef(null);
  const { pitchSettings } = useTeam();
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    const parent = ref.current.offsetParent;
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = player.position.x;
    const startTop = player.position.y;

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const dxPercent = (dx / parentRect.width) * 100;
      const dyPercent = (dy / parentRect.height) * 100;
      
      let newX = startLeft + dxPercent;
      let newY = startTop + dyPercent;
      
      // Bounds
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      updatePos(player.id, { x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Use kitColor for the border
  const borderColor = pitchSettings.kitColor || '#ffffff';

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => onDoubleClick(player)}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-20 group"
      style={{ left: `${player.position.x}%`, top: `${player.position.y}%` }}
    >
      {/* Circular Token */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110">
        {/* Main Circle (Photo) - Dynamic Border Color */}
        <div 
          className="w-full h-full rounded-full border-[3px] shadow-xl overflow-hidden bg-slate-800 relative z-10"
          style={{ borderColor: borderColor }}
        >
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-400">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Rating Badge (Level Number) */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white z-20 shadow-md",
          overall >= 85 ? "bg-yellow-500 text-black" :
          overall >= 75 ? "bg-emerald-500 text-white" :
          "bg-slate-500 text-white"
        )}>
          {overall}
        </div>

        {/* Role Indicator (Tiny dot top left) */}
        <div className={cn(
          "absolute top-0 left-0 w-4 h-4 rounded-full border-2 border-white shadow-sm z-20",
          player.role === 'GK' ? 'bg-yellow-400' :
          player.role === 'DEF' ? 'bg-blue-500' :
          player.role === 'MID' ? 'bg-emerald-500' : 'bg-rose-500'
        )}></div>
      </div>

      {/* Name Pill */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-lg whitespace-nowrap z-10">
        <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
          {player.nickname || player.name}
        </span>
      </div>
    </div>
  );
};

const Pitch = ({ onPlayerClick }) => {
  const { players, pitchSettings } = useTeam();
  const pitchRef = useRef(null);

  const getPitchBackground = () => {
    const { color } = pitchSettings;
    if (color === 'green') return 'bg-[#2d5a27]';
    if (color === 'red') return 'bg-[#4a1a1a]';
    if (color === 'blue') return 'bg-[#1a2a4a]';
    if (color === 'black') return 'bg-[#1a1a1a]';
    return 'bg-[#2d5a27]';
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden">
      <div 
        id="soccer-pitch"
        ref={pitchRef}
        className={cn(
          "relative w-full max-w-4xl aspect-[3/4] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-white/10 overflow-hidden transition-all duration-700 ease-in-out",
          getPitchBackground()
        )}
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
          <DraggableToken 
            key={player.id} 
            player={player} 
            overall={
              Object.values(player.stats || {}).length 
              ? Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / Object.values(player.stats).length) 
              : 75
            }
            onDoubleClick={onPlayerClick} 
            updatePos={useTeam().updatePlayerPosition}
          />
        ))}
      </div>
    </div>
  );
};

export default Pitch;
