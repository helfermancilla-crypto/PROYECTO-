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
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
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
  
  // Fabric Texture Style
  const fabricTexture = {
    backgroundImage: `
      linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 50%, rgba(255,255,255,0.1) 100%),
      repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px),
      radial-gradient(circle at 50% 0%, ${cardColor}, #000000)
    `,
    backgroundBlendMode: 'overlay, normal, normal'
  };

  const statLabels = {
    speed: 'PAC',
    dribbling: 'DRI',
    reception: 'PAS', // Using PAS for reception/control roughly
    passing: 'PAS',
    shooting: 'SHO',
    stamina: 'PHY',
    heading: 'DEF' // Using DEF for heading roughly or just HEA
  };

  // Mapping internal stats to FIFA-like display stats (6 main ones)
  const displayStats = [
    { label: 'PAC', val: player.stats.speed },
    { label: 'DRI', val: player.stats.dribbling },
    { label: 'SHO', val: player.stats.shooting },
    { label: 'DEF', val: player.stats.heading }, // Approx
    { label: 'PAS', val: player.stats.passing },
    { label: 'PHY', val: player.stats.stamina },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center">
        
        {/* The Card Itself - Shield Shape */}
        <div 
          ref={cardRef}
          className="relative w-[340px] h-[500px] shadow-2xl transition-all duration-300"
          style={{
            // Complex Shield Clip Path
            clipPath: "path('M 170 0 C 170 0 340 30 340 100 L 340 350 C 340 450 170 500 170 500 C 170 500 0 450 0 350 L 0 100 C 0 30 170 0 170 0 Z')",
            background: cardColor,
          }}
        >
          {/* Texture Overlay */}
          <div className="absolute inset-0 z-0" style={fabricTexture}></div>
          
          {/* Inner Border (Gold/Metallic) */}
          <div className="absolute inset-[6px] border-[3px] border-[#e2c076] z-10 opacity-80" 
               style={{ clipPath: "path('M 164 6 C 164 6 334 36 334 106 L 334 346 C 334 446 164 494 164 494 C 164 494 -6 446 -6 346 L -6 106 C -6 36 164 6 164 6 Z')" }}>
          </div>

          {/* Content Container */}
          <div className="absolute inset-0 z-20 p-6 flex flex-col">
            
            {/* Top Section: Info & Image */}
            <div className="flex flex-1 relative">
              {/* Left Info Column */}
              <div className="flex flex-col items-center w-1/4 pt-6 space-y-2">
                <div className="text-5xl font-bold text-[#e2c076] font-mono leading-none drop-shadow-md">{overall}</div>
                <div className="text-xl font-bold text-[#e2c076] uppercase tracking-wide">{player.role}</div>
                
                {/* Nation Flag */}
                <div className="w-10 h-6 relative mt-2 shadow-sm border border-white/20">
                  {player.nation ? (
                    <img src={player.nation} alt="Nation" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-700"></div>
                  )}
                </div>

                {/* Club Logo */}
                <div className="w-10 h-10 relative mt-2">
                   <img src={clubInfo.logo} alt="Club" className="w-full h-full object-contain drop-shadow-md" />
                </div>
              </div>

              {/* Player Image (Right/Center) */}
              <div className="flex-1 relative">
                {player.avatar ? (
                  <img 
                    src={player.avatar} 
                    alt={player.name} 
                    className="absolute bottom-0 right-[-10px] w-[220px] h-[260px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" 
                  />
                ) : (
                  <div className="absolute bottom-0 right-0 w-[180px] h-[200px] flex items-center justify-center text-white/10">
                    <span className="text-8xl">?</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Name & Stats */}
            <div className="h-[160px] flex flex-col justify-end pb-4">
              {/* Name */}
              <div className="text-center mb-3 relative">
                <h2 className="text-3xl font-bold text-white uppercase tracking-widest font-sans drop-shadow-lg truncate px-2">
                  {player.nickname || player.name}
                </h2>
                <div className="h-[2px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#e2c076] to-transparent mt-1"></div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-4">
                {displayStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white font-mono">{stat.val}</span>
                      <span className="text-sm font-bold text-[#e2c076] uppercase tracking-wider">{stat.label}</span>
                    </div>
                  </div>
                ))}
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
