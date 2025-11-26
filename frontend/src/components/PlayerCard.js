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

  const statsArr = Object.values(player.stats);
  const overall = Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length);
  const cardColor = pitchSettings.cardColor || '#1e293b';
  
  const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
  const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";

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
        
        <div className="relative group">
          <div 
            ref={cardRef}
            className="relative w-[380px] h-[500px] overflow-hidden"
            style={{
              // Adjusted clip-path to be slightly smaller than the border image to avoid white edges
              clipPath: "path('M 50 15 L 330 15 C 330 15 330 40 365 55 L 365 350 C 365 450 190 485 190 485 C 190 485 15 450 15 350 L 15 55 C 50 40 50 15 50 15 Z')",
              boxShadow: "0 0 30px rgba(0,0,0,0.5)"
            }}
          >
            {/* 1. Base Color */}
            <div className="absolute inset-0 z-0" style={{ backgroundColor: cardColor }}></div>

            {/* 2. Texture */}
            <div 
              className="absolute inset-0 z-10 opacity-60 mix-blend-multiply"
              style={{
                backgroundImage: `url('${TEXTURE_URL}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'contrast(1.2) brightness(1.1)'
              }}
            ></div>

            {/* 3. Content Layer - INCREASED PADDING (SAFE ZONE) */}
            <div className="absolute inset-0 z-20 flex flex-col px-12 py-14">
              
              {/* Top Section */}
              <div className="flex flex-1 relative">
                
                {/* Left Info */}
                <div className="flex flex-col items-center w-[28%] pt-6 space-y-2 z-30">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-4xl font-bold text-[#fde047] font-mono drop-shadow-md">{overall}</span>
                    <span className="text-lg font-bold text-[#fde047] uppercase tracking-wider drop-shadow-md">{player.role}</span>
                  </div>
                  
                  <div className="w-full h-[1px] bg-[#fde047]/40 my-1"></div>
                  
                  <div className="w-8 h-5 relative shadow-md border border-[#fde047]/30 overflow-hidden rounded-[2px]">
                    {player.nation ? (
                      <img src={player.nation} alt="Nation" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-600"></div>
                    )}
                  </div>

                  <div className="w-8 h-8 relative mt-1">
                     <img src={clubInfo.logo} alt="Club" className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                </div>

                {/* Player Image - SCALED DOWN & CENTERED */}
                <div className="absolute top-4 right-[-10px] w-[200px] h-[240px] z-20 flex items-end justify-center">
                  {player.avatar ? (
                    <img 
                      src={player.avatar} 
                      alt={player.name} 
                      className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" 
                    />
                  ) : (
                    <div className="text-white/20 text-8xl">?</div>
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="mt-auto relative z-30 pb-4">
                <div className="text-center mb-3">
                  <h2 className="text-3xl font-bold text-[#fde047] uppercase tracking-widest font-sans drop-shadow-lg truncate">
                    {player.nickname || player.name}
                  </h2>
                  <div className="h-[1px] w-2/3 mx-auto bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-60"></div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-2">
                  {displayStats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-start gap-2">
                      <span className="text-xl font-bold text-white font-mono drop-shadow-md">{stat.val}</span>
                      <span className="text-xs font-bold text-[#fde047] uppercase tracking-wider drop-shadow-md">{stat.label}</span>
                    </div>
                  ))}
                </div>
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
        </div>

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
