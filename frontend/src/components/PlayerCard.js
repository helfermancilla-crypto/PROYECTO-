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

  // Calculate Overall Rating
  const statsArr = Object.values(player.stats);
  const overall = Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length);

  // Card Colors from Settings
  const cardColor = pitchSettings.cardColor || '#1e293b';
  
  // Assets provided by user
  const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
  const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";

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
            className="relative w-[380px] h-[500px] overflow-hidden"
            style={{
              // Using a clip-path that matches the border image shape to trim the background
              clipPath: "path('M 50 15 L 330 15 C 330 15 330 40 365 55 L 365 350 C 365 450 190 485 190 485 C 190 485 15 450 15 350 L 15 55 C 50 40 50 15 50 15 Z')",
              boxShadow: "0 0 30px rgba(0,0,0,0.5)"
            }}
          >
            {/* 1. Base Color Layer (User Customizable) */}
            <div 
              className="absolute inset-0 z-0"
              style={{ backgroundColor: cardColor }}
            ></div>

            {/* 2. Texture Layer (Fabric Image) */}
            <div 
              className="absolute inset-0 z-10 opacity-60 mix-blend-multiply"
              style={{
                backgroundImage: `url('${TEXTURE_URL}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'contrast(1.2) brightness(1.1)' // Enhance texture details
              }}
            ></div>

            {/* 3. Content Layer */}
            <div className="absolute inset-0 z-20 flex flex-col p-8 pt-12">
              
              {/* Top Row: Rating/Info + Image */}
              <div className="flex flex-1 relative">
                
                {/* Left Column: Rating, Pos, Nation, Club */}
                <div className="flex flex-col items-center w-[25%] pt-4 space-y-2 z-30">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-5xl font-bold text-[#fde047] font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{overall}</span>
                    <span className="text-xl font-bold text-[#fde047] uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{player.role}</span>
                  </div>
                  
                  <div className="w-full h-[1px] bg-[#fde047]/40 my-1"></div>
                  
                  {/* Nation */}
                  <div className="w-10 h-6 relative shadow-md border border-[#fde047]/30 overflow-hidden rounded-[2px]">
                    {player.nation ? (
                      <img src={player.nation} alt="Nation" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-600"></div>
                    )}
                  </div>

                  {/* Club */}
                  <div className="w-10 h-10 relative mt-1">
                     <img src={clubInfo.logo} alt="Club" className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                </div>

                {/* Player Image */}
                <div className="absolute top-2 right-[-20px] w-[260px] h-[300px] z-20">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <span className="text-9xl">?</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Name & Stats */}
              <div className="mt-auto relative z-30 pb-6">
                {/* Name Plate */}
                <div className="text-center mb-3">
                  <h2 className="text-4xl font-bold text-[#fde047] uppercase tracking-widest font-sans drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] truncate">
                    {player.nickname || player.name}
                  </h2>
                  <div className="h-[2px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-70"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-4">
                  {displayStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-start gap-3">
                      <span className="text-2xl font-bold text-white font-mono drop-shadow-md">{stat.val}</span>
                      <span className="text-sm font-bold text-[#fde047] uppercase tracking-wider drop-shadow-md">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* 4. Border Layer (Top) */}
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
