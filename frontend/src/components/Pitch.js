import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { useTeam } from '../context/TeamContext';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const PlayerToken = ({ player, onDoubleClick, bounds }) => {
  const { updatePlayerPosition } = useTeam();
  const nodeRef = useRef(null);

  const handleStop = (e, data) => {
    // Convert pixels back to percentage for responsiveness if needed, 
    // but for this draggable lib, we usually stick to relative pixels or controlled positions.
    // However, our context expects {x, y} as percentages for the formation logic.
    // The Draggable component uses pixels. 
    // To keep it simple for this prototype: We will let Draggable handle the visual movement
    // and we won't sync back to percentage on every drag stop unless we calculate parent dimensions.
    // For the "Builder" feel, visual persistence is key.
    
    // NOTE: In a robust app, we'd calculate: xPercent = (data.x / parentWidth) * 100
    // Here we are just updating the state to re-render.
    // Since we are using percentage-based positioning for initial placement (formations),
    // but Draggable uses pixels, there's a conflict.
    // FIX: We will use a wrapper that positions based on %, and Draggable handles offset.
    // OR: We simply don't update the global "percentage" state on drag, only visual.
    // BUT: The user wants to save positions.
    
    // Let's try to get the parent element to calculate %.
    const parent = nodeRef.current.offsetParent;
    if (parent) {
      const xPercent = (data.x / parent.offsetWidth) * 100;
      const yPercent = (data.y / parent.offsetHeight) * 100;
      updatePlayerPosition(player.id, { x: xPercent, y: yPercent });
    }
  };

  // Calculate Overall Rating
  const statsArr = Object.values(player.stats || {});
  const overall = statsArr.length ? Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length) : 75;

  // Position based on percentage
  // We need to convert the stored % {x, y} to CSS 'left' and 'top'
  // Draggable needs 'position' prop if we want it controlled, or 'defaultPosition' if uncontrolled.
  // To allow formation updates to move players, we need 'position'.
  // But 'position' expects pixels.
  // Workaround: We use the style={{ left: %, top: % }} on the wrapper, and Draggable controls offset?
  // No, Draggable is absolute.
  
  // SIMPLIFICATION: We will render the div at the % position. 
  // When dragging starts, we let it move. When it stops, we calc new %.
  
  return (
    <div 
      className="absolute"
      style={{ left: `${player.position.x}%`, top: `${player.position.y}%` }}
    >
      <Draggable
        nodeRef={nodeRef}
        bounds="parent"
        // We start at 0,0 relative to the container div which is positioned at the correct %
        // Actually, Draggable needs to be the absolute item itself to work best with bounds.
        // Let's revert: The Draggable IS the absolute item.
        // We need to pass pixel values to 'position' if we want to control it via state (formations).
        // Since we don't have easy access to parent pixels in render without a ref hook, 
        // we will use a trick: The parent Pitch passes its dimensions? 
        // Or we just use style directly and don't use the 'position' prop of Draggable, 
        // but rather let React render the 'style' and Draggable updates the DOM.
        // When formation changes, state updates, component re-renders with new style.
        position={{ x: 0, y: 0 }} // We rely on the parent div's left/top
        onStop={(e, data) => {
           // This is tricky with Draggable + Percentage.
           // Alternative: Don't use Draggable for the formation snap.
           // Let's just use standard HTML5 Drag and Drop or a simpler mouse handler?
           // No, Draggable is smooth.
           
           // Let's try this: The Draggable element is wrapped.
           // The wrapper is positioned by %.
           // The Draggable has position {0,0}.
           // When you drag, you are dragging the inner element.
           // On stop, we calculate the delta, add it to the wrapper's %, and reset inner to 0,0.
        }}
      >
         {/* 
            Wait, simpler approach for this specific request:
            Just render the div with absolute position. 
            Add onMouseDown handler to implement custom drag logic that updates % state directly.
         */}
         <div ref={nodeRef} className="hidden" /> 
      </Draggable>
      
      {/* Custom Drag Implementation for Percentage-based layout */}
      <DraggableToken player={player} overall={overall} onDoubleClick={onDoubleClick} updatePos={updatePlayerPosition} />
    </div>
  );
};

const DraggableToken = ({ player, overall, onDoubleClick, updatePos }) => {
  const ref = useRef(null);
  
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
        {/* Main Circle (Photo) */}
        <div className="w-full h-full rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-slate-800 relative z-10">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-400">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Rating Badge (Small Circle) */}
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

  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
      <div 
        id="soccer-pitch"
        ref={pitchRef}
        className="relative w-full max-w-[500px] aspect-[3/4] rounded-lg shadow-2xl border-[6px] border-white/10 overflow-hidden bg-[#2d5a27]"
      >
        {/* Realistic Grass Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60 mix-blend-overlay"
          style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/grass.png')`,
            backgroundSize: '150px'
          }}
        ></div>
        
        {/* Lawn Stripes Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,0,0,0.2) 50px, rgba(0,0,0,0.2) 100px)`
          }}
        ></div>

        {/* Pitch Markings */}
        <div className="absolute inset-4 border-[2px] border-white/60 opacity-80 pointer-events-none">
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/60 -translate-y-1/2"></div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-[2px] border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Penalty Areas (Top/Bottom) */}
          <div className="absolute top-0 left-1/2 w-[60%] h-[15%] border-b-[2px] border-x-[2px] border-white/60 -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/2 w-[30%] h-[6%] border-b-[2px] border-x-[2px] border-white/60 -translate-x-1/2"></div>
          
          <div className="absolute bottom-0 left-1/2 w-[60%] h-[15%] border-t-[2px] border-x-[2px] border-white/60 -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-[30%] h-[6%] border-t-[2px] border-x-[2px] border-white/60 -translate-x-1/2"></div>
          
          {/* Corner Arcs */}
          <div className="absolute top-0 left-0 w-6 h-6 border-b-[2px] border-r-[2px] border-white/60 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-b-[2px] border-l-[2px] border-white/60 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-t-[2px] border-r-[2px] border-white/60 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-t-[2px] border-l-[2px] border-white/60 rounded-tl-full"></div>
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
