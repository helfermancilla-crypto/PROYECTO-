import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PlayerForm = ({ open, onOpenChange, onSubmit, initialData, onDelete }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    nickname: '',
    number: '10',
    role: 'MID',
    avatar: '',
    stats: {
      speed: 70,
      dribbling: 70,
      reception: 70,
      passing: 70,
      shooting: 70,
      stamina: 70,
      heading: 70
    }
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form for new player
      setFormData({
        name: '',
        nickname: '',
        number: '10',
        role: 'MID',
        avatar: '',
        stats: {
          speed: 70,
          dribbling: 70,
          reception: 70,
          passing: 70,
          shooting: 70,
          stamina: 70,
          heading: 70
        }
      });
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat, value) => {
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: value[0] }
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

  const handleSubmit = (e) => {
    console.log("Form submitted", formData);
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const statLabels = {
    speed: 'Velocidad',
    dribbling: 'Regate',
    reception: 'Control',
    passing: 'Pase',
    shooting: 'Tiro',
    stamina: 'Físico',
    heading: 'Cabezazo'
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

              <div className="space-y-2">
                <Label>Foto / Avatar</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="bg-slate-800 border-slate-700 cursor-pointer"
                />
                {formData.avatar && (
                  <div className="mt-2 flex justify-center">
                    <img src={formData.avatar} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500" />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-5 mt-4">
              {Object.entries(formData.stats).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs uppercase font-bold text-slate-400">
                    <span>{statLabels[key] || key}</span>
                    <span className="text-emerald-400">{val}</span>
                  </div>
                  <Slider 
                    value={[val]} 
                    max={99} 
                    min={1} 
                    step={1} 
                    onValueChange={v => handleStatChange(key, v)}
                    className="[&>.relative>.absolute]:bg-emerald-500"
                  />
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between sm:justify-between gap-2">
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
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
