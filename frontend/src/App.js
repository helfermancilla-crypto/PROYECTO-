import React, { useState, useRef } from 'react';
import { Download, RefreshCw, Upload, Palette, User, Activity, Shield } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Components ---

const StatInput = ({ label, value, onChange }) => (
  <div className="flex flex-col space-y-1.5">
    <div className="flex justify-between text-xs uppercase font-bold text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <Slider
      value={[value]}
      max={99}
      min={1}
      step={1}
      onValueChange={(vals) => onChange(vals[0])}
      className="[&>.relative>.absolute]:bg-primary"
    />
  </div>
);

const FifaCard = ({ data, cardRef }) => {
  const {
    name,
    rating,
    position,
    nation,
    club,
    image,
    stats,
    colors
  } = data;

  return (
    <div className="relative w-[320px] h-[480px] mx-auto perspective-1000 group">
      <div 
        ref={cardRef}
        className="relative w-full h-full fifa-card-shape transition-transform duration-500 ease-out transform group-hover:scale-[1.02] shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${colors.bgStart}, ${colors.bgEnd})`,
          boxShadow: `0 0 20px ${colors.bgStart}40`
        }}
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 bg-texture opacity-30 pointer-events-none mix-blend-overlay"></div>
        
        {/* Inner Border */}
        <div className="absolute inset-2 border border-[#e2c076]/30 fifa-card-shape pointer-events-none z-20"></div>
        <div className="absolute inset-3 border border-[#e2c076]/10 fifa-card-shape pointer-events-none z-20"></div>

        {/* Top Section: Rating, Position, Nation, Club */}
        <div className="absolute top-8 left-6 flex flex-col items-center z-30">
          <div className="text-5xl font-bold text-[#e2c076] leading-none tracking-tighter drop-shadow-md font-mono">
            {rating}
          </div>
          <div className="text-xl font-bold text-[#e2c076] uppercase tracking-wide mb-2 drop-shadow-sm">
            {position}
          </div>
          
          <div className="w-8 h-5 mb-2 relative overflow-hidden rounded shadow-sm border border-white/10 bg-black/20">
             {/* Placeholder for Nation Flag if URL is empty */}
             {nation ? (
               <img src={nation} alt="Nation" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-blue-500 flex items-center justify-center text-[8px] text-white">FLAG</div>
             )}
          </div>
          
          <div className="w-8 h-8 relative flex items-center justify-center">
            {/* Placeholder for Club Logo */}
            {club ? (
               <img src={club} alt="Club" className="w-full h-full object-contain drop-shadow-md" />
             ) : (
               <Shield className="w-6 h-6 text-[#e2c076]" />
             )}
          </div>
        </div>

        {/* Player Image */}
        <div className="absolute top-6 right-2 w-[220px] h-[260px] z-10">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <User size={100} />
            </div>
          )}
        </div>

        {/* Bottom Section: Name & Stats */}
        <div className="absolute bottom-0 left-0 right-0 h-[180px] flex flex-col justify-end pb-8 px-6 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="text-center mb-3">
            <h2 className="text-3xl font-bold text-white uppercase tracking-widest font-sans drop-shadow-lg truncate">
              {name}
            </h2>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#e2c076]/50 to-transparent mt-1"></div>
          </div>

          <div className="grid grid-cols-6 gap-1 text-[#e2c076] font-bold text-sm px-1">
            {/* Row 1 */}
            <div className="col-span-3 flex items-center justify-center space-x-1 border-r border-[#e2c076]/20">
              <span className="font-mono text-lg">{stats.pac}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">PAC</span>
            </div>
            <div className="col-span-3 flex items-center justify-center space-x-1">
              <span className="font-mono text-lg">{stats.dri}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">DRI</span>
            </div>

            {/* Row 2 */}
            <div className="col-span-3 flex items-center justify-center space-x-1 border-r border-[#e2c076]/20">
              <span className="font-mono text-lg">{stats.sho}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">SHO</span>
            </div>
            <div className="col-span-3 flex items-center justify-center space-x-1">
              <span className="font-mono text-lg">{stats.def}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">DEF</span>
            </div>

            {/* Row 3 */}
            <div className="col-span-3 flex items-center justify-center space-x-1 border-r border-[#e2c076]/20">
              <span className="font-mono text-lg">{stats.pas}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">PAS</span>
            </div>
            <div className="col-span-3 flex items-center justify-center space-x-1">
              <span className="font-mono text-lg">{stats.phy}</span>
              <span className="text-xs font-normal text-[#e2c076]/80">PHY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardEditor = ({ data, onChange, onExport }) => {
  const handleStatChange = (key, value) => {
    onChange({ ...data, stats: { ...data.stats, [key]: value } });
  };

  const handleColorChange = (key, value) => {
    onChange({ ...data, colors: { ...data.colors, [key]: value } });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Card Creator</h2>
        <Button onClick={onExport} className="bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white shadow-lg shadow-primary/20">
          <Download className="mr-2 h-4 w-4" /> Export PNG
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
          <TabsContent value="general" className="space-y-4 mt-0">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Player Name</Label>
                    <Input 
                      value={data.name} 
                      onChange={(e) => onChange({...data, name: e.target.value})}
                      placeholder="E.g. MESSI"
                      className="uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <Input 
                      type="number" 
                      value={data.rating} 
                      onChange={(e) => onChange({...data, rating: e.target.value})}
                      max={99}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select 
                      value={data.position} 
                      onValueChange={(val) => onChange({...data, position: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pos" />
                      </SelectTrigger>
                      <SelectContent>
                        {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK'].map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality (URL)</Label>
                    <Input 
                      value={data.nation} 
                      onChange={(e) => onChange({...data, nation: e.target.value})}
                      placeholder="Flag Image URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Club Logo (URL)</Label>
                  <Input 
                    value={data.club} 
                    onChange={(e) => onChange({...data, club: e.target.value})}
                    placeholder="Club Logo URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Player Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    {data.image && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onChange({...data, image: ''})}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: Transparent PNG</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <Card>
              <CardContent className="pt-6 grid grid-cols-2 gap-6">
                <StatInput label="Pace" value={data.stats.pac} onChange={(v) => handleStatChange('pac', v)} />
                <StatInput label="Shooting" value={data.stats.sho} onChange={(v) => handleStatChange('sho', v)} />
                <StatInput label="Passing" value={data.stats.pas} onChange={(v) => handleStatChange('pas', v)} />
                <StatInput label="Dribbling" value={data.stats.dri} onChange={(v) => handleStatChange('dri', v)} />
                <StatInput label="Defense" value={data.stats.def} onChange={(v) => handleStatChange('def', v)} />
                <StatInput label="Physical" value={data.stats.phy} onChange={(v) => handleStatChange('phy', v)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="mt-0">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <Label>Background Gradient</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border shadow-sm" style={{backgroundColor: data.colors.bgStart}}></div>
                        <Input 
                          type="color" 
                          value={data.colors.bgStart}
                          onChange={(e) => handleColorChange('bgStart', e.target.value)}
                          className="w-full h-8 p-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border shadow-sm" style={{backgroundColor: data.colors.bgEnd}}></div>
                        <Input 
                          type="color" 
                          value={data.colors.bgEnd}
                          onChange={(e) => handleColorChange('bgEnd', e.target.value)}
                          className="w-full h-8 p-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Presets</Label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onChange({...data, colors: { bgStart: '#e11d48', bgEnd: '#0f172a' }})}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 to-slate-900 ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                    />
                    <button 
                      onClick={() => onChange({...data, colors: { bgStart: '#3b82f6', bgEnd: '#1e3a8a' }})}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-900 ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                    />
                    <button 
                      onClick={() => onChange({...data, colors: { bgStart: '#10b981', bgEnd: '#064e3b' }})}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-900 ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                    />
                    <button 
                      onClick={() => onChange({...data, colors: { bgStart: '#f59e0b', bgEnd: '#78350f' }})}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-900 ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

function App() {
  const cardRef = useRef(null);
  const [cardData, setCardData] = useState({
    name: 'RONALDO',
    rating: '99',
    position: 'ST',
    nation: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/255px-Flag_of_Portugal.svg.png',
    club: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
    image: 'https://pngimg.com/d/ronaldo_PNG18.png',
    stats: {
      pac: 95,
      sho: 99,
      pas: 88,
      dri: 94,
      def: 45,
      phy: 85
    },
    colors: {
      bgStart: '#e11d48', // Red-600
      bgEnd: '#020617'    // Slate-950
    }
  });

  const handleExport = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 2, // Higher quality
          useCORS: true, // Allow loading cross-origin images
          logging: true,
        });
        
        const link = document.createElement('a');
        link.download = `${cardData.name}_card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error("Export failed:", error);
        alert("Could not export card. Note: Cross-origin images (like the default ones) might block canvas export due to browser security. Try uploading your own local images.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel: Preview */}
      <div className="w-full md:w-1/2 lg:w-3/5 h-[50vh] md:h-screen bg-secondary/30 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0"></div>
        <div className="z-10 scale-75 md:scale-100 lg:scale-110 transition-all duration-300">
          <FifaCard data={cardData} cardRef={cardRef} />
        </div>
        
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          <p>Preview Mode • Real-time Updates</p>
        </div>
      </div>

      {/* Right Panel: Controls */}
      <div className="w-full md:w-1/2 lg:w-2/5 h-[50vh] md:h-screen bg-background border-l border-border flex flex-col">
        <div className="p-6 md:p-8 h-full overflow-hidden">
          <CardEditor 
            data={cardData} 
            onChange={setCardData} 
            onExport={handleExport} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
