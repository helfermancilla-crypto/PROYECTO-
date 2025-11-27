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
  const statsArr = Object.values(player.stats);
  const overall = Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length);
  const voteCount = player.votes ? player.votes.length : 0;
  
  // Colors & Gradient Logic
  const color1 = pitchSettings.cardColor || '#1e293b';
  const color2 = pitchSettings.cardColor2 || '#0f172a';
  const gradientType = pitchSettings.cardGradient || 'diagonal';
  
  let backgroundStyle = { backgroundColor: color1 };
  if (gradientType === 'vertical') backgroundStyle = { background: `linear-gradient(to bottom, ${color1}, ${color2})` };
  if (gradientType === 'horizontal') backgroundStyle = { background: `linear-gradient(to right, ${color1}, ${color2})` };
  if (gradientType === 'diagonal') backgroundStyle = { background: `linear-gradient(135deg, ${color1}, ${color2})` };

  // Manual Fit Adjustments
  const contentScale = (pitchSettings.cardContentScale || 100) / 100;
  const translateY = pitchSettings.cardContentY || 0;
  
  const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
  const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";

  // Spanish Stats Mapping
  const displayStats = [
    { label: 'RIT', val: player.stats.pac },
    { label: 'REG', val: player.stats.dri },
    { label: 'TIR', val: player.stats.sho },
    { label: 'DEF', val: player.stats.def }, 
    { label: 'PAS', val: player.stats.pas },
    { label: 'FIS', val: player.stats.phy },
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

      {/* 2. Texture */}
      <div 
        className="absolute inset-0 z-10 opacity-50 mix-blend-multiply"
        style={{
          backgroundImage: `url('${TEXTURE_URL}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.2) brightness(1.1)'
        }}
      ></div>

      {/* 3. Content Layer - With Manual Adjustments */}
      <div 
        className="absolute inset-0 z-20 flex flex-col px-14 py-16 transition-transform duration-200"
        style={{
          transform: `scale(${contentScale}) translateY(${translateY}px)`
        }}
      >
        
        {/* Top Section */}
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

          {/* Player Image */}
          <div className="absolute top-4 right-[-20px] w-[200px] h-[240px] z-20 flex items-end justify-center">
            {player.avatar ? (
              <img 
                src={player.avatar} 
                alt={player.name} 
                className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" 
              />
            ) : (
              <div className="text-white/20 text-8xl font-fifa">?</div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto relative z-30 pb-6">
          {/* Name */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-[#fde047] uppercase tracking-widest drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] truncate px-2">
              {player.nickname || player.name}
            </h2>
            <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-60"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0 px-2">
            {displayStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
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

      {/* 4. Border Layer */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          backgroundImage: `url('${BORDER_URL}')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
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

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `${player.name}_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
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
