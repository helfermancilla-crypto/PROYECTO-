import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';

const PlayerCard = ({ player, open, onOpenChange, onEdit, onGenerateLink }) => {
  const cardRef = useRef(null);

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

  // Calculate Overall Rating (Simple Average)
  const statsArr = Object.values(player.stats);
  const overall = Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length);

  const getCardGradient = () => {
    // Dynamic based on role or just a cool default
    return "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center">
        
        {/* The Card Itself */}
        <div 
          ref={cardRef}
          className={cn(
            "relative w-[320px] h-[480px] rounded-xl overflow-hidden shadow-2xl border-4 border-yellow-600/50",
            getCardGradient()
          )}
        >
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          {/* Top Info */}
          <div className="absolute top-4 left-4 z-10 flex flex-col items-center">
            <span className="text-4xl font-bold text-yellow-400 font-mono leading-none">{overall}</span>
            <span className="text-lg font-bold text-yellow-400/80 uppercase">{player.role}</span>
            <div className="mt-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
               {/* Nation/Team placeholder */}
               <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          {/* Player Image */}
          <div className="absolute top-8 right-0 w-[240px] h-[280px] z-0">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/10">
                <span className="text-6xl">?</span>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-black via-black/80 to-transparent z-10 p-4 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-white uppercase tracking-wider text-center mb-1 drop-shadow-md">
              {player.nickname || player.name}
            </h2>
            <div className="w-full h-0.5 bg-yellow-600/50 mb-3"></div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {Object.entries(player.stats).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase font-bold text-xs tracking-wider">{key.substring(0, 3)}</span>
                  <span className="text-yellow-400 font-mono font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 w-full justify-center">
          <Button onClick={handleDownload} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Download className="w-5 h-5" />
          </Button>
          <Button onClick={() => onEdit(player)} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
            <Edit className="w-5 h-5" />
          </Button>
          <Button onClick={() => onGenerateLink(player)} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6">
            <Share2 className="w-4 h-4 mr-2" /> Vote Link
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
