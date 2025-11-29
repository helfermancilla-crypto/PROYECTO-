import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Upload } from 'lucide-react';

const COMMON_NATIONS = [
  { name: 'Argentina', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/2560px-Flag_of_Argentina.svg.png' },
  { name: 'Brasil', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/2560px-Flag_of_Brazil.svg.png' },
  { name: 'España', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png' },
  { name: 'Francia', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/2560px-Flag_of_France.svg.png' },
  { name: 'Alemania', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/2560px-Flag_of_Germany.svg.png' },
  { name: 'Italia', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/2560px-Flag_of_Italy.svg.png' },
  { name: 'Inglaterra', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Flag_of_England.svg/2560px-Flag_of_England.svg.png' },
  { name: 'Portugal', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/2560px-Flag_of_Portugal.svg.png' },
  { name: 'Holanda', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/2560px-Flag_of_the_Netherlands.svg.png' },
  { name: 'Bélgica', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Flag_of_Belgium.svg/2560px-Flag_of_Belgium.svg.png' },
  { name: 'Colombia', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/2560px-Flag_of_Colombia.svg.png' },
  { name: 'Uruguay', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/2560px-Flag_of_Uruguay.svg.png' },
  { name: 'Chile', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/2560px-Flag_of_Chile.svg.png' },
  { name: 'México', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/2560px-Flag_of_Mexico.svg.png' },
  { name: 'Perú', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru.svg/2560px-Flag_of_Peru.svg.png' },
  { name: 'EE.UU.', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2560px-Flag_of_the_United_States.svg.png' },
  { name: 'Japón', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/2560px-Flag_of_Japan.svg.png' },
  { name: 'Corea del Sur', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/2560px-Flag_of_South_Korea.svg.png' },
  { name: 'Marruecos', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flag_of_Morocco.svg/2560px-Flag_of_Morocco.svg.png' },
  { name: 'Croacia', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Croatia.svg/2560px-Flag_of_Croatia.svg.png' },
  { name: 'Personalizado', flag: '' }
];

const PlayerForm = ({ open, onOpenChange, onSubmit, initialData, onDelete }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    nickname: '',
    number: '10',
    role: 'MID',
    nation: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png',
    avatar: '',
    stats: {
      pac: 70, sho: 70, pas: 70, dri: 70, def: 70, phy: 70
    }
  });

  const [nationSelection, setNationSelection] = React.useState('España');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (initialData) {
      const stats = initialData.stats || {};
      setFormData({
        ...initialData,
        stats: {
          pac: stats.pac || stats.speed || 70,
          sho: stats.sho || stats.shooting || 70,
          pas: stats.pas || stats.passing || 70,
          dri: stats.dri || stats.dribbling || 70,
          def: stats.def || stats.heading || 70,
          phy: stats.phy || stats.stamina || 70
        }
      });
      
      // Try to find if the nation matches a preset
      const foundNation = COMMON_NATIONS.find(n => n.flag === initialData.nation);
      if (foundNation) {
        setNationSelection(foundNation.name);
      } else {
        setNationSelection('Personalizado');
      }
    } else {
      // Default new player
      setFormData({
        name: '',
        nickname: '',
        number: '10',
        role: 'MID',
        nation: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png',
        avatar: '',
        stats: { pac: 70, sho: 70, pas: 70, dri: 70, def: 70, phy: 70 }
      });
      setNationSelection('España');
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat, value) => {
    let safeValue = parseInt(value);
    if (isNaN(safeValue)) safeValue = 0;
    if (safeValue > 99) safeValue = 99;
    if (safeValue < 0) safeValue = 0;

    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: safeValue }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNationChange = (value) => {
    setNationSelection(value);
    const selected = COMMON_NATIONS.find(n => n.name === value);
    if (selected && selected.name !== 'Personalizado') {
      handleChange('nation', selected.flag);
    } else {
      // Keep existing if switching to custom, or clear it? Let's keep it to be safe
      // User will upload new one
    }
  };

  const handleNationUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('nation', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const statLabels = {
    pac: 'Ritmo (PAC)',
    sho: 'Tiro (TIR)',
    pas: 'Pase (PAS)',
    dri: 'Regate (REG)',
    def: 'Defensa (DEF)',
    phy: 'Físico (FIS)'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-emerald-400">
            {initialData ? 'Editar Jugador' : 'Nuevo Jugador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apodo (Opcional)</Label>
                  <Input 
                    value={formData.nickname} 
                    onChange={e => handleChange('nickname', e.target.value)} 
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input 
                    type="number" 
                    value={formData.number} 
                    onChange={e => handleChange('number', e.target.value)} 
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Posición</Label>
                  <Select value={formData.role} onValueChange={val => handleChange('role', val)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="GK">Portero</SelectItem>
                      <SelectItem value="DEF">Defensa</SelectItem>
                      <SelectItem value="MID">Centrocampista</SelectItem>
                      <SelectItem value="FWD">Delantero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* NATION SELECTOR */}
              <div className="space-y-2">
                <Label>Nacionalidad</Label>
                <div className="flex gap-2 items-center">
                   <div className="flex-1">
                     <Select value={nationSelection} onValueChange={handleNationChange}>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[200px]">
                          {COMMON_NATIONS.map(nation => (
                            <SelectItem key={nation.name} value={nation.name}>
                              <div className="flex items-center gap-2">
                                {nation.flag && <img src={nation.flag} alt={nation.name} className="w-5 h-3 object-cover" />}
                                <span>{nation.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                   </div>
                   
                   {/* Preview Flag */}
                   <div className="w-10 h-8 bg-slate-800 border border-slate-700 rounded flex items-center justify-center overflow-hidden">
                      {formData.nation ? (
                        <img src={formData.nation} alt="Flag" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-500">?</span>
                      )}
                   </div>
                </div>

                {/* Custom Upload Option */}
                {nationSelection === 'Personalizado' && (
                  <div className="mt-2">
                    <Label className="text-xs text-slate-400 mb-1 block">Subir Bandera Personalizada</Label>
                    <div className="relative">
                      <Button type="button" variant="outline" className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Seleccionar Imagen
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleNationUpload}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Foto / Avatar</Label>
                <div className="relative">
                  <Button type="button" variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 relative">
                    <ImageIcon className="w-4 h-4 mr-2" /> 
                    {formData.avatar ? 'Cambiar Foto' : 'Subir Foto'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
                {formData.avatar && (
                  <div className="mt-2 flex justify-center">
                    <img src={formData.avatar} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-lg" />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-4 px-1">
              {Object.entries(formData.stats).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs uppercase font-bold text-slate-400 w-24">
                      {statLabels[key] || key}
                    </Label>
                    
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleStatChange(key, e.target.value)}
                      className="w-20 h-8 text-right bg-slate-950 border border-slate-700 rounded-md text-emerald-400 px-2 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      min="0"
                      max="99"
                    />
                  </div>
                  
                  <Slider 
                    value={[val]} 
                    max={99} 
                    min={0} 
                    step={1} 
                    onValueChange={v => handleStatChange(key, v[0])}
                    className="[&>.relative>.absolute]:bg-emerald-500 py-2 cursor-pointer"
                  />
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between sm:justify-between gap-2 pt-4 border-t border-slate-800">
            {initialData && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => {
                  onDelete(initialData.id);
                  onOpenChange(false);
                }}
              >
                Eliminar
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Guardar Jugador
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerForm;
