import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Edit, X, Users, Image as ImageIcon, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { useTeam } from '../context/TeamContext';

// --- Helper to convert image URL to Data URL ---
const imgToDataURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(url); 
    img.src = url;
  });
};

// --- 1. Reusable Visual Component ---
export const CardVisual = ({ player, pitchSettings, clubInfo, cardRef, scale = 1 }) => {
  // Calculate Overall Rating
  const statsArr = Object.values(player.stats || {});
  const overall = statsArr.length ? Math.round(statsArr.reduce((a, b) => a + b, 0) / statsArr.length) : 0;
  const voteCount = player.votes ? player.votes.length : 0;
  
  const color1 = pitchSettings.cardColor || '#1e293b';
  const color2 = pitchSettings.cardColor2 || '#0f172a';
  const gradientType = pitchSettings.cardGradient || 'diagonal';
  
  let backgroundStyle = { backgroundColor: color1 };
  if (gradientType === 'vertical') backgroundStyle = { background: `linear-gradient(to bottom, ${color1}, ${color2})` };
  if (gradientType === 'horizontal') backgroundStyle = { background: `linear-gradient(to right, ${color1}, ${color2})` };
  if (gradientType === 'diagonal') backgroundStyle = { background: `linear-gradient(135deg, ${color1}, ${color2})` };

  const texScale = pitchSettings.cardTextureScale || 150;
  const texX = pitchSettings.cardTextureX || 50;
  const texY = pitchSettings.cardTextureY || 50;
  const texOpacity = pitchSettings.cardTextureOpacity ?? 0.5;

  const borderScale = pitchSettings.cardBorderScale || 100;
  const borderX = pitchSettings.cardBorderX || 0;
  const borderY = pitchSettings.cardBorderY || 0;

  const contentScale = (pitchSettings.cardContentScale || 100) / 100;
  const translateY = pitchSettings.cardContentY || 0;
  const translateX = pitchSettings.cardContentX || 0;

  const pSet = player.photoSettings || {};
  const imgScale = (pSet.scale || 100) / 100;
  const imgX = pSet.x || 0;
  const imgY = pSet.y || 0;
  
  const cropTop = pSet.cropTop || 0;
  const cropRight = pSet.cropRight || 0;
  const cropBottom = pSet.cropBottom || 0;
  const cropLeft = pSet.cropLeft || 0;
  
  const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
  const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";

  // 9 STATS MAPPING (3 COLUMNS)
  const stats = player.stats || {};
  
  const displayStats = [
    // Col 1
    { label: 'RIT', val: stats.rit || 0 },
    { label: 'TIR', val: stats.tir || 0 },
    { label: 'PAS', val: stats.pas || 0 },
    // Col 2
    { label: 'REG', val: stats.reg || 0 },
    { label: 'DEF', val: stats.def || 0 },
    { label: 'FIS', val: stats.fis || 0 },
    // Col 3
    { label: 'CON', val: stats.con || 0 },
    { label: 'RES', val: stats.res || 0 },
    { label: 'CAB', val: stats.cab || 0 },
  ];

  return (
    <div 
      ref={cardRef}
      className="relative w-[380px] h-[500px] overflow-hidden font-fifa shadow-2xl origin-top-left bg-transparent"
      style={{
        clipPath: "path('M 50 15 L 330 15 C 330 15 330 40 365 55 L 365 350 C 365 450 190 485 190 485 C 190 485 15 450 15 350 L 15 55 C 50 40 50 15 50 15 Z')",
        transform: `scale(${scale})`, 
        marginBottom: scale < 1 ? `-${500 * (1 - scale)}px` : 0, 
        marginRight: scale < 1 ? `-${380 * (1 - scale)}px` : 0,
      }}
    >
      {/* 1. Base Color */}
      <div className="absolute inset-0 z-0" style={backgroundStyle}></div>

      {/* 2. Texture */}
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

      {/* 3. Content */}
      <div 
        className="absolute inset-0 z-20 flex flex-col px-14 py-16 transition-transform duration-200"
        style={{
          transform: `scale(${contentScale}) translate(${translateX}px, ${translateY}px)`
        }}
      >
        <div className="flex flex-1 relative">
          <div className="flex flex-col items-center w-[30%] pt-6 space-y-1 z-30 ml-2">
            <div className="flex flex-col items-center leading-none">
              <span className="text-[3rem] font-bold text-[#fde047] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{overall}</span>
              <span className="text-lg font-bold text-[#fde047] uppercase tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] -mt-1">{player.role}</span>
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

        <div className="mt-auto relative z-30 pb-6">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-[#fde047] uppercase tracking-widest drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] truncate px-2">
              {player.nickname || player.name}
            </h2>
            <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#fde047] to-transparent opacity-60"></div>
          </div>

          {/* 9 STATS GRID - 3 COLUMNS */}
          <div className="grid grid-cols-3 gap-x-1 gap-y-0 px-0 text-center">
            {displayStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center leading-tight">
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white drop-shadow-md">{stat.val}</span>
                    <span className="text-[10px] font-bold text-[#fde047] uppercase tracking-wider drop-shadow-md">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
          
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

      {/* 4. Border */}
      <div 
        className="absolute inset-0 z-40 pointer-events-none transition-all duration-200"
        style={{
          backgroundImage: `url('${BORDER_URL}')`,
          backgroundSize: `${borderScale}% ${borderScale}%`,
          backgroundPosition: `${50 + borderX}% ${50 + borderY}%`,
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
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!player) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    if (cardRef.current) {
      try {
        // Pre-process images
        const TEXTURE_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/xmbei8xh_textura%20de%20tela.png";
        const BORDER_URL = "https://customer-assets.emergentagent.com/job_cardcreator-11/artifacts/g95tghim_borde%20dorado.png";
        
        const textureBase64 = await imgToDataURL(TEXTURE_URL);
        const borderBase64 = await imgToDataURL(BORDER_URL);
        
        // Temporarily swap DOM images
        const textureDiv = cardRef.current.querySelector('.mix-blend-multiply');
        const borderDiv = cardRef.current.querySelector('.z-40');
        
        const originalTexture = textureDiv.style.backgroundImage;
        const originalBorder = borderDiv.style.backgroundImage;
        
        textureDiv.style.backgroundImage = `url('${textureBase64}')`;
        borderDiv.style.backgroundImage = `url('${borderBase64}')`;

        const imgs = cardRef.current.querySelectorAll('img');
        const originalSrcs = [];
        for (let i = 0; i < imgs.length; i++) {
          originalSrcs.push(imgs[i].src);
          if (imgs[i].src.startsWith('http')) {
             try {
               const base64 = await imgToDataURL(imgs[i].src);
               imgs[i].src = base64;
             } catch (e) { console.warn(e); }
          }
        }

        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 3,
          useCORS: true, 
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true,
          removeContainer: true,
        });
        
        textureDiv.style.backgroundImage = originalTexture;
        borderDiv.style.backgroundImage = originalBorder;
        for (let i = 0; i < imgs.length; i++) {
          imgs[i].src = originalSrcs[i];
        }

        const imgData = canvas.toDataURL('image/png');
        setGeneratedImage(imgData);
        
        try {
            const link = document.createElement('a');
            link.download = `${player.name}_card.png`;
            link.href = imgData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(e) {
            console.warn("Auto-download blocked, showing manual option");
        }

      } catch (error) {
        console.error("Generation failed:", error);
        alert("Error al generar la imagen.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleClose = (open) => {
    if (!open) setGeneratedImage(null);
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
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
            <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                size="default" 
                className="rounded-full bg-white hover:bg-white/90 text-black font-bold border border-white/20 px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              {isGenerating ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generando...</>
              ) : (
                  <><Download className="w-5 h-5 mr-2" /> DESCARGAR IMAGEN</>
              )}
            </Button>
            
            <Button onClick={() => onEdit(player)} size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Edit className="w-5 h-5" />
            </Button>
            
            <DialogClose asChild>
               <Button size="icon" className="rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50">
                  <X className="w-5 h-5" />
               </Button>
            </DialogClose>
          </div>

        </DialogContent>
      </Dialog>

      <Dialog open={!!generatedImage} onOpenChange={() => setGeneratedImage(null)}>
        <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-emerald-400">¡Tarjeta Lista!</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-950 p-4 rounded-lg border border-slate-800 shadow-inner">
                {generatedImage && (
                    <img src={generatedImage} alt="Generated Card" className="h-[400px] w-auto object-contain shadow-2xl rounded-lg" />
                )}
            </div>
            <p className="text-sm text-center text-slate-400 max-w-xs">
              Si la descarga no empezó automáticamente: <br/>
              <span className="text-emerald-400 font-bold">Haz clic derecho (o mantén presionado) en la imagen y elige "Guardar imagen"</span>
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setGeneratedImage(null)} variant="secondary" className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerCard;
