import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Pitch from '../components/Pitch';
import PlayerForm from '../components/PlayerForm';
import PlayerCard from '../components/PlayerCard';
import { Button } from "@/components/ui/button";
import { Settings, Download, Plus, Shield, Users, Layout } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { FORMATIONS } from '@/lib/formations';

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
    applyFormation
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
      toast.success("Player added to the squad");
    }
    setEditingPlayer(null);
  };

  const handleGenerateLink = (player) => {
    const url = `${window.location.origin}/vote/${player.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Voting link copied to clipboard!");
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
              placeholder="CLUB NAME"
            />
            <p className="text-xs text-emerald-500 font-bold tracking-wider uppercase">Official Lineup</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button onClick={handleExportImage} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20">
             <Download className="w-4 h-4 mr-2" /> Export
           </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Pitch Area */}
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Background Ambience */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950"></div>
          
          <Pitch onPlayerClick={handlePlayerClick} />
        </div>

        {/* Right: Controls & Roster */}
        <div className="w-full md:w-[350px] lg:w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl">
          
          {/* Controls Section */}
          <div className="p-6 space-y-6 border-b border-slate-800 bg-slate-900/50">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-3 h-3" /> Formation
              </Label>
              <Select 
                value={pitchSettings.formation} 
                onValueChange={applyFormation}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-10">
                  <SelectValue placeholder="Select Formation" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {Object.keys(FORMATIONS).map(fmt => (
                    <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => { setEditingPlayer(null); setIsFormOpen(true); }} 
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Player
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-slate-800 text-white">
                  <SheetHeader>
                    <SheetTitle className="text-emerald-400">Visual Settings</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Roster List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3 h-3" /> Squad List
              </span>
              <span className="text-xs font-mono text-emerald-500">{players.length} Players</span>
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
                    No players yet.<br/>Click "Add Player" to start.
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

// Helper for class names in the list
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default Home;
