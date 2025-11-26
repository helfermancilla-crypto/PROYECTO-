import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Pitch from '../components/Pitch';
import PlayerForm from '../components/PlayerForm';
import PlayerCard from '../components/PlayerCard';
import { Button } from "@/components/ui/button";
import { Settings, Download, Upload, Plus, Share2, Palette, Box, Layers } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import html2canvas from 'html2canvas';

const Home = () => {
  const navigate = useNavigate();
  const { 
    players, 
    addPlayer, 
    updatePlayer, 
    deletePlayer, 
    pitchSettings, 
    setPitchSettings,
    importTeam 
  } = useTeam();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

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
      toast.success("Player updated successfully");
    } else {
      addPlayer(data);
      toast.success("Player added to the pitch");
    }
    setEditingPlayer(null);
  };

  const handleGenerateLink = (player) => {
    const url = `${window.location.origin}/vote/${player.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Voting link copied to clipboard!");
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ players, pitchSettings }, null, 2);
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
        if (success) toast.success("Team imported successfully!");
        else toast.error("Invalid team file.");
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
      link.download = 'my_team.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg rotate-3 flex items-center justify-center font-bold text-slate-900 shadow-lg shadow-emerald-500/20">SB</div>
          <h1 className="text-xl font-bold tracking-wider uppercase font-mono hidden md:block">Soccer Builder</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-full p-1 border border-slate-700 mr-2">
            <Button 
              size="sm" 
              variant={pitchSettings.viewMode === '2d' ? 'secondary' : 'ghost'}
              onClick={() => setPitchSettings(prev => ({...prev, viewMode: '2d'}))}
              className="h-7 rounded-full px-3 text-xs"
            >
              <Layers className="w-3 h-3 mr-1" /> 2D
            </Button>
            <Button 
              size="sm" 
              variant={pitchSettings.viewMode === '3d' ? 'secondary' : 'ghost'}
              onClick={() => setPitchSettings(prev => ({...prev, viewMode: '3d'}))}
              className="h-7 rounded-full px-3 text-xs"
            >
              <Box className="w-3 h-3 mr-1" /> 3D
            </Button>
          </div>

          <Button 
            onClick={() => { setEditingPlayer(null); setIsFormOpen(true); }} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Add Player</span>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Settings">
                <Settings className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 border-slate-800 text-white">
              <SheetHeader>
                <SheetTitle className="text-emerald-400 text-xl font-bold uppercase tracking-wider">Team Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-8">
                
                {/* Kit Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase text-xs tracking-wider">
                    <Palette className="w-4 h-4" /> Kit Customization
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Jersey Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600 shadow-sm" style={{backgroundColor: pitchSettings.kitColor}}></div>
                        <Input 
                          type="color" 
                          value={pitchSettings.kitColor}
                          onChange={(e) => setPitchSettings(prev => ({...prev, kitColor: e.target.value}))}
                          className="w-full h-8 p-1 bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Number Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-slate-600 shadow-sm" style={{backgroundColor: pitchSettings.kitNumberColor}}></div>
                        <Input 
                          type="color" 
                          value={pitchSettings.kitNumberColor}
                          onChange={(e) => setPitchSettings(prev => ({...prev, kitNumberColor: e.target.value}))}
                          className="w-full h-8 p-1 bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pitch Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase text-xs tracking-wider">
                    <Settings className="w-4 h-4" /> Pitch Options
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pitch Mode</Label>
                    <Select 
                      value={pitchSettings.mode} 
                      onValueChange={(v) => setPitchSettings(prev => ({...prev, mode: v}))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="11">11 vs 11 (Full)</SelectItem>
                        <SelectItem value="7">7 vs 7 (Small)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pitch Color</Label>
                    <Select 
                      value={pitchSettings.color} 
                      onValueChange={(v) => setPitchSettings(prev => ({...prev, color: v}))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="green">Classic Green</SelectItem>
                        <SelectItem value="red">Inferno Red</SelectItem>
                        <SelectItem value="blue">Night Blue</SelectItem>
                        <SelectItem value="black">Obsidian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>View Mode</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="3d-mode"
                        checked={pitchSettings.viewMode === '3d'}
                        onCheckedChange={(checked) => setPitchSettings(prev => ({...prev, viewMode: checked ? '3d' : '2d'}))}
                      />
                      <Label htmlFor="3d-mode">Enable 3D Perspective</Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <Label className="text-slate-400 uppercase text-xs font-bold tracking-wider">Data Management</Label>
                  <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Download className="w-4 h-4 mr-2" /> Export Team JSON
                  </Button>
                  <div className="relative">
                    <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                      <Upload className="w-4 h-4 mr-2" /> Import Team JSON
                    </Button>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportJSON}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <Button onClick={handleExportImage} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Share2 className="w-4 h-4 mr-2" /> Download Pitch Image
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
        
        <Pitch onPlayerClick={handlePlayerClick} />
        
        <div className="absolute bottom-4 text-slate-500 text-xs">
          Drag players to position • Double-click to edit
        </div>
      </main>

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
