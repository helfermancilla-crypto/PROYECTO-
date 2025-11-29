import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit, X, Users } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useTeam } from '../context/TeamContext';

// --- 1. Reusable Visual Component (The Card Itself) ---
export const CardVisual = ({ player, pitchSettings, clubInfo, cardRef, scale = 1 }) => {
  // Calculate Overall Rating
  const statsArr = Object.values(player.stats || {});
  const overall = statsArr.length ? Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length) : 0;
  const voteCount = player.votes ? player.votes.length : 0;
  
  // Colors & Gradient Logic
  const color1 = pitchSettings.cardColor || '#1e293b';
  const color2 = pitchSettings.cardColor2 || '#0f172a';
  const gradientType = pitchSettings.cardGradient || 'diagonal';
  
  let backgroundStyle = { backgroundColor: color1 };
  if (gradientType === 'vertical') backgroundStyle = { background: `linear-gradient(to bottom, ${color1}, ${color2})` };
  if (gradientType === 'horizontal') backgroundStyle = { background: `linear-gradient(to right, ${color1}, ${color2})` };
  if (gradientType === 'diagonal') backgroundStyle = { background: `linear-gradient(135deg, ${color1}, ${color2})` };

  // Texture Settings
  const texScale = pitchSettings.cardTextureScale || 150;
  const texX = pitchSettings.cardTextureX || 50;
  const texY = pitchSettings.cardTextureY || 50;
  const texOpacity = pitchSettings.cardTextureOpacity ?? 0.5;

  // Border Settings
  const borderScale = pitchSettings.cardBorderScale || 100;
  const borderX = pitchSettings.cardBorderX || 0;
  const borderY = pitchSettings.cardBorderY || 0;

  // Manual Fit Adjustments (Global Content - TEXT & INFO)
  const contentScale = (pitchSettings.cardContentScale || 100) / 100;
  const contentX = pitchSettings.cardContentX || 0;
  const contentY = pitchSettings.cardContentY || 0;

  // Player Image Specific Adjustments
  const pSet = player.photoSettings || {};
  const imgScale = (pSet.scale || 100) / 100;
  const imgX = pSet.x || 0;
  const imgY = pSet.y || 0;
  
  // Crops
  const cropTop = pSet.cropTop || 0;
  const cropRight = pSet.cropRight || 0;
  const cropBottom = pSet.cropBottom || 0;
  const cropLeft = pSet.cropLeft || 0;
  
  const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
  const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";

  // 7 Stats Mapping
  const stats = player.stats || {};
  const displayStats = [
    { label: 'RIT', val: stats.speed || stats.pac || 0 },
    { label: 'REG', val: stats.dribbling || stats.dri || 0 },
    { label: 'REC', val: stats.reception || 0 },
    { label: 'PAS', val: stats.passing || stats.pas || 0 },
    { label: 'TIR', val: stats.shooting || stats.sho || 0 },
    { label: 'FIS', val: stats.stamina || stats.phy || 0 },
    { label: 'DEF', val: stats.heading || stats.def || 0 },
  ];

  return (
    <div 
      ref={cardRef}
      className="relative w-[380px] h-[500px] overflow-hidden font-fifa shadow-2xl origin-top-left"
      style={{
        clipPath: "path('M 50 15 L 330 15 C 330 15 330 40 365 55 L 365 350 C 365 450 190 485 190 485 C 190 485 15 450 15 350 L 15 55 C 50 40 50 15 50 15 Z')",
        transform: `scale(${scale})`, 
        marginBottom: scale < 1 ? `-${500 * (1 - scale)}px` : 0, 
        marginRight: scale < 1 ? `-${380 * (1 - scale)}px` : 0
      }}
    >
      {/* 1. Base Color / Gradient */}
      <div className="absolute inset-0 z-0" style={backgroundStyle}></div>

      {/* 2. Texture Layer */}
      <div 
        className="absolute inset-0 z-10 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url('${TEXTURE_URL}')`,
          backgroundSize: `${texScale}%`, 
          backgroundPosition: `${texX}% ${texY}%`,
          backgroundRepeat: 'repeat', 
          opacity: texOpacity,
          filter: 'contrast(1.2) brightness(1.1)'
        }}
      ></div>

      {/* 3. Content Layer (Text & Info) - SEPARATED FROM IMAGE */}
      <div 
        className="absolute inset-0 z-30 flex flex-col px-14 py-16 pointer-events-none"
        style={{
          transform: `scale(${contentScale}) translate(${contentX}px, ${contentY}px)`
        }}
      >
        
        {/* Top Section Info (Rating, Club, Nation) */}
        <div className="flex flex-1 relative">
          
          {/* Left Info Column */}
          <div className="flex flex-col items-center w-[30%] pt-6 space-y-1 z-30 ml-2">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[3rem] font-bold text-[#fde047] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{overall}</span>
              <span className="text-lg font-bold text-[#fde047] uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] -mt-1">{player.role}</span>
            </div>
            
            <div className="w-full h-[1px] bg-[#fde047]/40 my-1"></div>
            
            {/* Nation */}
            <div className="w-8 h-5 relative shadow-md border border-[#fde047]/30 overflow-hidden rounded-[2px]">
              {player.nation ? (
                <img src={player.nation} alt="Nation" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-600"></div>
              )}
            </div>

            {/* Club */}
            <div className="w-8 h-8 relative mt-1">
               <img src={clubInfo.logo} alt="Club" className="w-full h-full object-contain drop-shadow-lg" />
            </div>
          </div>

        </div>

        {/* Bottom Section (Name & Stats) */}
        <div className="mt-auto relative z-30 pb-6">
          {/* Name */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-[#fde047] uppercase tracking-widest drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] truncate px-2">
              {player.nickname || player.name}
            </h2>
            <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-60"></div>
          </div>

          {/* Stats - 7 Items Grid */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-0 px-2">
            {displayStats.map((stat, i) => (
              <div key={i} className={cn(
                "flex items-center justify-center gap-2",
                i === 6 ? "col-span-2" : "" // Center the 7th item
              )}>
                <span className="text-lg font-bold text-white drop-shadow-md w-6 text-right">{stat.val}</span>
                <span className="text-xs font-bold text-[#fde047] uppercase tracking-wider drop-shadow-md w-6 text-left">{stat.label}</span>
              </div>
            ))}
          </div>
          
          {/* Vote Count Indicator */}
          {voteCount > 0 && (
            <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-[#fde047]/20">
                <Users className="w-3 h-3 text-[#fde047]" />
                <span className="text-[10px] font-bold text-white">{voteCount} Votos</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3b. Image Layer (Separate for Independent Control) */}
      <div className="absolute inset-0 z-20 px-14 py-16 flex flex-col pointer-events-none">
          <div className="flex flex-1 relative">
            <div className="absolute top-4 right-[-20px] w-[200px] h-[240px] z-20 flex items-end justify-center">
                {player.avatar ? (
                <img 
                    src={player.avatar} 
                    alt={player.name} 
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-all duration-200"
                    style={{
                    transform: `scale(${imgScale}) translate(${imgX}px, ${imgY}px)`,
                    clipPath: `inset(${cropTop}% ${cropRight}% ${cropBottom}% ${cropLeft}%)`
                    }}
                />
                ) : (
                <div className="text-white/20 text-8xl font-fifa">?</div>
                )}
            </div>
          </div>
      </div>

      {/* 4. Border Layer (ADJUSTABLE) */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none transition-all duration-200"
        style={{
          backgroundImage: `url('${BORDER_URL}')`,
          backgroundSize: `${borderScale}% ${borderScale}%`, // Scale both dimensions
          backgroundPosition: `${50 + borderX}% ${50 + borderY}%`, // Center + Offset
          backgroundRepeat: 'no-repeat'
        }}
      ></div>

    </div>
  );
};

// --- 2. Main Dialog Component ---
const PlayerCard = ({ player, open, onOpenChange, onEdit, onGenerateLink }) => {
  const cardRef = useRef(null);
  const { pitchSettings, clubInfo } = useTeam();

  if (!player) return null;

  const handleDownload = async () => {
    if (cardRef.current) {
      const images = cardRef.current.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      });
      await Promise.all(promises);

      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 3,
          useCORS: true, // Enable CORS to load external images
          logging: true, // Enable logging for debug
          allowTaint: false, // CRITICAL: Must be false to allow toDataURL
          foreignObjectRendering: false // Sometimes helps stability
        });
        
        const link = document.createElement('a');
        link.download = `${player.name}_card.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link); // Append to body to ensure click works
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Error al exportar. Por favor intenta de nuevo. (Detalle: Posible bloqueo de seguridad del navegador)");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center">
        
        <div className="relative group">
          <CardVisual 
            player={player} 
            pitchSettings={pitchSettings} 
            clubInfo={clubInfo} 
            cardRef={cardRef} 
          />
        </div>

        <div className="flex gap-2 mt-6 w-full justify-center">
          <Button onClick={handleDownload} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Download className="w-5 h-5" />
          </Button>
          <Button onClick={() => onEdit(player)} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Edit className="w-5 h-5" />
          </Button>
          <Button onClick={() => onGenerateLink(player)} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 font-fifa tracking-wide">
            <Share2 className="w-4 h-4 mr-2" /> Votar
          </Button>
          <DialogClose asChild>
             <Button size="icon" className="rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50">
                <X className="w-5 h-5" />
             </Button>
          </DialogClose>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default PlayerCard;
