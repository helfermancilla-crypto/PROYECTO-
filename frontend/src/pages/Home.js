import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Pitch from '../components/Pitch';
import PlayerForm from '../components/PlayerForm';
import PlayerCard, { CardVisual } from '../components/PlayerCard';
import { Button } from "@/components/ui/button";
import { Settings, Download, Upload, Plus, Share2, Palette, Layout, Activity, Shield, Trophy, Move, Maximize, Crop, Image as ImageIcon, RefreshCcw, Check, Layers, BoxSelect, Save } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { FORMATIONS } from '@/lib/formations';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { 
    players, 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    pitchSettings, 
    setPitchSettings,
    clubInfo,
    setClubInfo,
    applyFormation,
    importTeam
  } = useTeam();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  
  // State for the Player Selector in Settings
  const [selectedPreviewPlayerId, setSelectedPreviewPlayerId] = useState('preview');
  
  // Temporary state for individual photo adjustments before saving
  const [photoAdjustments, setPhotoAdjustments] = useState({
    scale: 100, x: 0, y: 0,
    cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0
  });

  // Effect to load player's saved settings when selected
  React.useEffect(() => {
    if (selectedPreviewPlayerId === 'preview') {
      setPhotoAdjustments({ scale: 100, x: 0, y: 0, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 });
    } else {
      const player = players.find(p => p.id === selectedPreviewPlayerId);
      if (player && player.photoSettings) {
        setPhotoAdjustments(player.photoSettings);
      } else {
        setPhotoAdjustments({ scale: 100, x: 0, y: 0, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 });
      }
    }
  }, [selectedPreviewPlayerId, players]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsCardOpen(true);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setIsCardOpen(false);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (editingPlayer) {
      updatePlayer(editingPlayer.id, data);
      toast.success("Jugador actualizado con éxito");
    } else {
      addPlayer(data);
      toast.success("Jugador añadido a la plantilla");
    }
    setEditingPlayer(null);
  };

  const handleGenerateLink = (player) => {
    const url = `${window.location.origin}/vote/${player.id}`;
    navigator.clipboard.writeText(url);
    toast.success("¡Enlace de votación copiado!");
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ players, pitchSettings, clubInfo }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'soccer_builder_team.json';
    link.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = importTeam(event.target.result);
        if (success) toast.success("¡Equipo importado con éxito!");
        else toast.error("Archivo de equipo inválido.");
      };
      reader.readAsText(file);
    }
  };

  const handleExportImage = async () => {
    const element = document.getElementById('soccer-pitch');
    if (element) {
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `${clubInfo.name.replace(/\s+/g, '_')}_lineup.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClubInfo(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPhotoSettings = () => {
    setPhotoAdjustments({
      scale: 100, x: 0, y: 0,
      cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0
    });
    toast.info("Ajustes de foto restablecidos (No guardado)");
  };

  const savePhotoSettings = () => {
    if (selectedPreviewPlayerId === 'preview') {
      toast.warning("Selecciona un jugador real para guardar");
      return;
    }
    
    updatePlayer(selectedPreviewPlayerId, { photoSettings: photoAdjustments });
    toast.success("¡Ajustes de foto guardados para este jugador!");
  };

  // Preset colors
  const colorPresets = [
    { name: 'Rojo', c1: '#ef4444', c2: '#7f1d1d' },
    { name: 'Azul', c1: '#3b82f6', c2: '#1e3a8a' },
    { name: 'Verde', c1: '#22c55e', c2: '#14532d' },
    { name: 'Dorado', c1: '#eab308', c2: '#713f12' },
    { name: 'Negro', c1: '#334155', c2: '#0f172a' },
  ];

  const applyPreset = (preset) => {
    setPitchSettings(prev => ({
      ...prev,
      cardColor: preset.c1,
      cardColor2: preset.c2
    }));
  };

  // Calculate Team Stats
  const calculateTeamStats = () => {
    if (players.length === 0) return { overall: 0, att: 0, mid: 0, def: 0 };
    
    const getAvg = (role) => {
      const rolePlayers = players.filter(p => role === 'ALL' || p.role === role);
      if (rolePlayers.length === 0) return 0;
      
      const sum = rolePlayers.reduce((acc, p) => {
        const stats = Object.values(p.stats || {});
        const pAvg = stats.length ? stats.reduce((a, b) => a + b, 0) / stats.length : 0;
        return acc + pAvg;
      }, 0);
      
      return Math.round(sum / rolePlayers.length);
    };

    return {
      overall: getAvg('ALL'),
      att: getAvg('FWD'),
      mid: getAvg('MID'),
      def: getAvg('DEF')
    };
  };

  const teamStats = calculateTeamStats();

  // Dummy player for preview
  const dummyPlayer = {
    id: 'preview',
    name: 'EJEMPLO',
    role: 'FWD',
    number: '10',
    nation: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
    stats: { pac: 90, dri: 88, sho: 85, def: 70, pas: 82, phy: 80, rec: 85 }
  };

  // Determine which player to show in preview
  const currentPlayer = selectedPreviewPlayerId === 'preview' 
    ? dummyPlayer 
    : players.find(p => p.id === selectedPreviewPlayerId) || dummyPlayer;

  // Merge the photo adjustments into the player object for rendering ONLY
  const playerWithAdjustments = {
    ...currentPlayer,
    photoSettings: photoAdjustments
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 md:px-10 z-50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 group cursor-pointer">
            <img 
              src={clubInfo.logo} 
              alt="Club Logo" 
              className="w-full h-full object-contain drop-shadow-md transition-transform group-hover:scale-110" 
            />
            <Input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleLogoUpload}
            />
          </div>
          <div>
            <Input 
              value={clubInfo.name}
              onChange={(e) => setClubInfo(prev => ({ ...prev, name: e.target.value }))}
              className="bg-transparent border-none text-xl md:text-2xl font-bold uppercase tracking-widest text-white placeholder:text-slate-600 focus-visible:ring-0 p-0 h-auto font-mono"
              placeholder="NOMBRE DEL CLUB"
            />
            <p className="text-xs text-emerald-500 font-bold tracking-wider uppercase">Alineación Oficial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button onClick={handleExportImage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20">
             <Download className="w-4 h-4 mr-2" /> Exportar
           </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Pitch Area */}
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
          
          <Pitch onPlayerClick={handlePlayerClick} />
        </div>

        {/* Right: Controls & Roster */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl">
          
          {/* Controls Section */}
          <div className="p-6 space-y-6 border-b border-slate-800 bg-slate-900/50">
            
            {/* Team Stats Panel */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <div className="flex flex-col items-center justify-center border-r border-slate-700 pr-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Media</span>
                <span className="text-2xl font-bold text-white">{teamStats.overall}</span>
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-1">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 uppercase">ATT</span>
                  <span className="text-sm font-bold text-emerald-400">{teamStats.att}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 uppercase">MID</span>
                  <span className="text-sm font-bold text-yellow-400">{teamStats.mid}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 uppercase">DEF</span>
                  <span className="text-sm font-bold text-blue-400">{teamStats.def}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => { setEditingPlayer(null); setIsFormOpen(true); }} 
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Añadir Jugador
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                
                <SheetContent className="bg-slate-900 border-slate-800 text-white overflow-y-auto w-full sm:max-w-[1000px]">
                  <SheetHeader>
                    <SheetTitle className="text-emerald-400">Estación de Edición</SheetTitle>
                  </SheetHeader>
                  
                  {/* SIDE-BY-SIDE LAYOUT WITH OPTIMIZED SPACING */}
                  <div className="flex flex-col lg:flex-row h-full py-4 gap-4">
                    
                    {/* LEFT COLUMN: STICKY PREVIEW */}
                    <div className="flex-1 lg:flex-[0.4] flex flex-col items-center lg:items-end lg:sticky lg:top-0 h-fit">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shadow-2xl flex flex-col items-center gap-3 w-full">
                        <div className="w-full flex justify-between items-center">
                            <Label className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Vista Previa</Label>
                            <Select value={selectedPreviewPlayerId} onValueChange={setSelectedPreviewPlayerId}>
                                <SelectTrigger className="w-[160px] h-7 text-xs bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Seleccionar Jugador" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                    <SelectItem value="preview">-- Ejemplo --</SelectItem>
                                    {players.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} (#{p.number})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* CARD VISUAL WITH CORRECT SCALING PROP */}
                        <div className="flex justify-center">
                          <CardVisual 
                            player={playerWithAdjustments} 
                            pitchSettings={pitchSettings} 
                            clubInfo={clubInfo} 
                            scale={0.75} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: CONTROLS */}
                    <div className="flex-1 lg:flex-[0.6] space-y-6 pr-2 pb-20">
                      
                      {/* 1. PLAYER IMAGE EDITOR */}
                      <div className="space-y-3 border-b border-slate-800 pb-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-emerald-400 uppercase font-bold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Editor de Foto (Individual)
                          </Label>
                          <div className="flex gap-2">
                            <Button size="xs" variant="ghost" onClick={resetPhotoSettings} className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800">
                                <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                            <Button size="xs" onClick={savePhotoSettings} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Save className="w-3 h-3 mr-1" /> Guardar Foto
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Zoom & Position */}
                          <div className="space-y-2 bg-slate-950/30 p-3 rounded border border-slate-800">
                            <Label className="text-[10px] text-slate-500 font-bold uppercase">Posición y Zoom</Label>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]"><span>Zoom</span><span className="text-emerald-400">{photoAdjustments.scale}%</span></div>
                              <Slider value={[photoAdjustments.scale]} min={50} max={200} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, scale: v[0]}))} className="[&>.relative>.absolute]:bg-blue-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>X</span><span>{photoAdjustments.x}</span></div>
                                <Slider value={[photoAdjustments.x]} min={-150} max={150} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, x: v[0]}))} className="[&>.relative>.absolute]:bg-blue-500" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>Y</span><span>{photoAdjustments.y}</span></div>
                                <Slider value={[photoAdjustments.y]} min={-150} max={150} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, y: v[0]}))} className="[&>.relative>.absolute]:bg-blue-500" />
                              </div>
                            </div>
                          </div>

                          {/* Crop Controls */}
                          <div className="space-y-2 bg-slate-950/30 p-3 rounded border border-slate-800">
                            <Label className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1"><Crop className="w-3 h-3" /> Recortes (Crop)</Label>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]"><span>Superior (Top)</span><span>{photoAdjustments.cropTop}%</span></div>
                              <Slider value={[photoAdjustments.cropTop]} min={0} max={50} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, cropTop: v[0]}))} className="[&>.relative>.absolute]:bg-red-500" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]"><span>Inferior (Bottom)</span><span>{photoAdjustments.cropBottom}%</span></div>
                              <Slider value={[photoAdjustments.cropBottom]} min={0} max={50} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, cropBottom: v[0]}))} className="[&>.relative>.absolute]:bg-red-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>Izq (L)</span><span>{photoAdjustments.cropLeft}%</span></div>
                                <Slider value={[photoAdjustments.cropLeft]} min={0} max={50} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, cropLeft: v[0]}))} className="[&>.relative>.absolute]:bg-red-500" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>Der (R)</span><span>{photoAdjustments.cropRight}%</span></div>
                                <Slider value={[photoAdjustments.cropRight]} min={0} max={50} step={1} onValueChange={(v) => setPhotoAdjustments(prev => ({...prev, cropRight: v[0]}))} className="[&>.relative>.absolute]:bg-red-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. GLOBAL SETTINGS */}
                      <Label className="text-xs text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800 pb-2 mb-2 block">Ajustes Globales</Label>

                      {/* Quick Colors */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estilos Rápidos</Label>
                        <div className="flex gap-2 flex-wrap">
                          {colorPresets.map(p => (
                            <button 
                              key={p.name}
                              onClick={() => applyPreset(p)}
                              className="w-6 h-6 rounded-full border-2 border-slate-600 hover:scale-110 transition-transform shadow-md"
                              style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                              title={p.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Colors */}
                        <div className="space-y-3">
                          <Label className="text-xs text-slate-400 uppercase font-bold flex gap-2"><Palette className="w-3 h-3" /> Colores</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px] text-slate-500">Principal</Label>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded border border-slate-600" style={{backgroundColor: pitchSettings.cardColor}}></div>
                                <Input type="color" value={pitchSettings.cardColor} onChange={(e) => setPitchSettings(prev => ({...prev, cardColor: e.target.value}))} className="h-7 p-1 bg-slate-800 border-slate-700" />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[10px] text-slate-500">Secundario</Label>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded border border-slate-600" style={{backgroundColor: pitchSettings.cardColor2}}></div>
                                <Input type="color" value={pitchSettings.cardColor2} onChange={(e) => setPitchSettings(prev => ({...prev, cardColor2: e.target.value}))} className="h-7 p-1 bg-slate-800 border-slate-700" />
                              </div>
                            </div>
                          </div>
                          <Select value={pitchSettings.cardGradient} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardGradient: v}))}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="none">Sólido</SelectItem>
                              <SelectItem value="vertical">Vertical</SelectItem>
                              <SelectItem value="horizontal">Horizontal</SelectItem>
                              <SelectItem value="diagonal">Diagonal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Texture */}
                        <div className="space-y-3">
                          <Label className="text-xs text-slate-400 uppercase font-bold flex gap-2"><Layers className="w-3 h-3" /> Textura</Label>
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]"><span>Zoom</span><span>{pitchSettings.cardTextureScale}%</span></div>
                              <Slider value={[pitchSettings.cardTextureScale || 150]} min={50} max={200} step={1} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardTextureScale: v[0]}))} className="[&>.relative>.absolute]:bg-slate-500" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]"><span>Opacidad</span><span>{Math.round((pitchSettings.cardTextureOpacity ?? 0.5) * 100)}%</span></div>
                              <Slider value={[(pitchSettings.cardTextureOpacity ?? 0.5) * 100]} min={0} max={100} step={1} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardTextureOpacity: v[0]/100}))} className="[&>.relative>.absolute]:bg-slate-500" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Border Controls */}
                      <div className="space-y-3 border-t border-slate-800 pt-3">
                        <Label className="text-xs text-slate-400 uppercase font-bold flex gap-2"><BoxSelect className="w-3 h-3" /> Ajuste de Marco</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>Escala</span></div>
                                <Slider value={[pitchSettings.cardBorderScale || 100]} min={90} max={110} step={0.5} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardBorderScale: v[0]}))} className="[&>.relative>.absolute]:bg-yellow-500" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>X</span></div>
                                <Slider value={[pitchSettings.cardBorderX || 0]} min={-20} max={20} step={1} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardBorderX: v[0]}))} className="[&>.relative>.absolute]:bg-yellow-500" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]"><span>Y</span></div>
                                <Slider value={[pitchSettings.cardBorderY || 0]} min={-20} max={20} step={1} onValueChange={(v) => setPitchSettings(prev => ({...prev, cardBorderY: v[0]}))} className="[&>.relative>.absolute]:bg-yellow-500" />
                            </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8 text-xs">
                          <Download className="w-3 h-3 mr-2" /> Exportar Datos
                        </Button>
                      </div>

                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Roster List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3 h-3" /> Plantilla
              </span>
              <span className="text-xs font-mono text-emerald-500">{players.length} Jugadores</span>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {players.map(player => (
                  <div 
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">{player.number}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{player.name}</p>
                        <span className="text-xs font-mono text-yellow-500 font-bold">
                          {Object.values(player.stats || {}).length 
                            ? Math.round(Object.values(player.stats).reduce((a, b) => a + b, 0) / Object.values(player.stats).length) 
                            : 75}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          player.role === 'GK' ? 'bg-yellow-400' :
                          player.role === 'DEF' ? 'bg-blue-500' :
                          player.role === 'MID' ? 'bg-emerald-500' : 'bg-rose-500'
                        )}></span>
                        <span>{player.role}</span>
                        <span className="text-slate-600">•</span>
                        <span>#{player.number}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {players.length === 0 && (
                  <div className="text-center py-10 text-slate-600 text-sm">
                    Aún no hay jugadores.<br/>Haz clic en "Añadir Jugador" para empezar.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PlayerForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleFormSubmit}
        initialData={editingPlayer}
        onDelete={deletePlayer}
      />

      <PlayerCard 
        player={selectedPlayer}
        open={isCardOpen}
        onOpenChange={setIsCardOpen}
        onEdit={handleEdit}
        onGenerateLink={handleGenerateLink}
      />
    </div>
  );
};

export default Home;
