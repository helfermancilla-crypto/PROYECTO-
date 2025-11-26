import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useTeam } from '../context/TeamContext';

const PlayerCard = ({ player, open, onOpenChange, onEdit, onGenerateLink }) => {
  const cardRef = useRef(null);
  const { pitchSettings, clubInfo } = useTeam();

  if (!player) return null;

  const handleDownload = async () => {
    if (cardRef.current) {
      // Wait for images to load
      const images = cardRef.current.querySelectorAll('img');
      const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      });
      await Promise.all(promises);

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3, // Higher quality
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `${player.name}_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // Calculate Overall Rating
  const statsArr = Object.values(player.stats);
  const overall = Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length);

  // Card Colors from Settings
  const cardColor = pitchSettings.cardColor || '#1e293b';
  
  // Stats Mapping
  const displayStats = [
    { label: 'PAC', val: player.stats.speed },
    { label: 'DRI', val: player.stats.dribbling },
    { label: 'SHO', val: player.stats.shooting },
    { label: 'DEF', val: player.stats.heading }, 
    { label: 'PAS', val: player.stats.passing },
    { label: 'PHY', val: player.stats.stamina },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center">
        
        {/* Card Container */}
        <div className="relative group">
          
          {/* The Card */}
          <div 
            ref={cardRef}
            className="relative w-[320px] h-[480px] overflow-hidden"
            style={{
              // Standard FIFA Card Shape
              clipPath: "path('M 50 0 L 270 0 C 290 0 320 20 320 50 L 320 350 C 320 450 160 480 160 480 C 160 480 0 450 0 350 L 0 50 C 0 20 30 0 50 0 Z')",
              backgroundColor: cardColor,
              boxShadow: "0 0 20px rgba(0,0,0,0.5)"
            }}
          >
            {/* 1. Background Texture (Fabric/Silk) */}
            <div 
              className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(120deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 10px),
                  radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)
                `
              }}
            ></div>

            {/* 2. Golden Border (Inner) */}
            <div 
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                padding: '8px',
                clipPath: "path('M 50 0 L 270 0 C 290 0 320 20 320 50 L 320 350 C 320 450 160 480 160 480 C 160 480 0 450 0 350 L 0 50 C 0 20 30 0 50 0 Z')",
              }}
            >
              <div className="w-full h-full border-[3px] border-[#facc15] opacity-90 rounded-t-[2rem] rounded-b-[5rem]"></div>
            </div>

            {/* 3. Content Layer */}
            <div className="absolute inset-0 z-20 flex flex-col p-5">
              
              {/* Top Row: Rating/Info + Image */}
              <div className="flex flex-1 relative">
                
                {/* Left Column: Rating, Pos, Nation, Club */}
                <div className="flex flex-col items-center w-[25%] pt-6 space-y-1 z-30">
                  <span className="text-5xl font-bold text-[#facc15] font-mono leading-[0.8] drop-shadow-md">{overall}</span>
                  <span className="text-xl font-bold text-[#facc15] uppercase tracking-wider drop-shadow-sm">{player.role}</span>
                  
                  <div className="w-full h-[1px] bg-[#facc15]/50 my-1"></div>
                  
                  {/* Nation */}
                  <div className="w-8 h-5 relative shadow-sm border border-[#facc15]/30 overflow-hidden">
                    {player.nation ? (
                      <img src={player.nation} alt="Nation" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-600"></div>
                    )}
                  </div>

                  {/* Club */}
                  <div className="w-8 h-8 relative mt-1">
                     <img src={clubInfo.logo} alt="Club" className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                </div>

                {/* Player Image (Absolute to break out of grid if needed) */}
                <div className="absolute top-4 right-[-10px] w-[240px] h-[280px] z-20">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <span className="text-8xl">?</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Name & Stats */}
              <div className="mt-auto relative z-30">
                {/* Name Plate */}
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-bold text-white uppercase tracking-widest font-sans drop-shadow-lg truncate border-b-2 border-[#facc15]/50 pb-1 mx-2">
                    {player.nickname || player.name}
                  </h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 px-2 pb-4">
                  {displayStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-start gap-2">
                      <span className="text-xl font-bold text-white font-mono drop-shadow-sm">{stat.val}</span>
                      <span className="text-sm font-bold text-[#facc15] uppercase tracking-wider drop-shadow-sm">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 w-full justify-center">
          <Button onClick={handleDownload} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Download className="w-5 h-5" />
          </Button>
          <Button onClick={() => onEdit(player)} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Edit className="w-5 h-5" />
          </Button>
          <Button onClick={() => onGenerateLink(player)} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6">
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
