import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Pitch from '../components/Pitch';
import PlayerForm from '../components/PlayerForm';
import PlayerCard from '../components/PlayerCard';
import { Button } from "@/components/ui/button";
import { Settings, Download, Upload, Plus, Share2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    // In a real app, this would be a unique URL.
    // Here we route to the voting page with the ID.
    const url = `${window.location.origin}/vote/${player.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Voting link copied to clipboard!");
    // Also open it to show the user
    // window.open(url, '_blank');
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
      const canvas = await html2canvas(element, { scale: 2 });
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
          <div className="w-8 h-8 bg-emerald-500 rounded-lg rotate-3 flex items-center justify-center font-bold text-slate-900">SB</div>
          <h1 className="text-xl font-bold tracking-wider uppercase font-mono">Soccer Builder</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => { setEditingPlayer(null); setIsFormOpen(true); }} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Player
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800 text-slate-300">
                <Settings className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-900 border-slate-800 text-white">
              <SheetHeader>
                <SheetTitle className="text-emerald-400">Match Settings</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
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
                  <Label>Texture</Label>
                  <Select 
                    value={pitchSettings.texture} 
                    onValueChange={(v) => setPitchSettings(prev => ({...prev, texture: v}))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="striped">Striped</SelectItem>
                      <SelectItem value="checkered">Checkered</SelectItem>
                      <SelectItem value="plain">Plain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <Label className="text-slate-400 uppercase text-xs font-bold tracking-wider">Data Management</Label>
                  <Button onClick={handleExportJSON} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Download className="w-4 h-4 mr-2" /> Export Team JSON
                  </Button>
                  <div className="relative">
                    <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Upload className="w-4 h-4 mr-2" /> Import Team JSON
                    </Button>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportJSON}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <Button onClick={handleExportImage} variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800">
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
          Drag players to position • Click to edit
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
