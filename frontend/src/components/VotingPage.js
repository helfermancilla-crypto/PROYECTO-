import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from "sonner";

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const VotingPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await axios.get(`${API_URL}/player/${playerId}`);
        setPlayer(response.data);
        // Use the correct stats structure
        const stats = response.data.stats || {};
        setVotes({
          rit: stats.rit || 70,
          tir: stats.tir || 70,
          pas: stats.pas || 70,
          reg: stats.reg || 70,
          def: stats.def || 70,
          fis: stats.fis || 70,
          con: stats.con || 70,
          res: stats.res || 70,
          cab: stats.cab || 70
        });
      } catch (error) {
        console.error("Error fetching player:", error);
        toast.error("No se pudo cargar el jugador. Verifica el enlace.");
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  const handleVoteChange = (stat, value) => {
    setVotes(prev => ({ ...prev, [stat]: value[0] }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/player/${playerId}/vote`, votes);
      setSubmitted(true);
      toast.success("¡Voto enviado correctamente!");
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error("Error al enviar el voto.");
    }
  };

  const statLabels = {
    speed: 'Velocidad',
    dribbling: 'Regate',
    reception: 'Recepción',
    passing: 'Pase',
    shooting: 'Disparo',
    stamina: 'Resistencia',
    heading: 'Cabezazo'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Jugador no encontrado</h1>
          <p className="text-slate-400 mb-4">Este enlace podría ser inválido o el jugador fue eliminado.</p>
          <Button onClick={() => navigate('/')}>Ir al Inicio</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-emerald-500/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">¡Voto Registrado!</h2>
            <p className="text-slate-400">
              Gracias por votar en las estadísticas de {player.name}. Los promedios se han actualizado en la base de datos.
            </p>
            <Button onClick={() => navigate('/')} className="w-full bg-slate-800 hover:bg-slate-700">
              Volver al Campo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 flex justify-center">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800 text-white">
        <CardHeader className="text-center border-b border-slate-800 pb-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden mb-4">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{player.number}</div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold uppercase tracking-wider text-emerald-400">{player.name}</CardTitle>
          <CardDescription className="text-slate-400">Vota los atributos del jugador</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {Object.entries(votes).map(([key, val]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm font-bold uppercase tracking-wide">
                <span className="text-slate-300">{statLabels[key] || key}</span>
                <span className="text-emerald-400">{val}</span>
              </div>
              <Slider 
                value={[val]} 
                max={99} 
                min={1} 
                step={1} 
                onValueChange={v => handleVoteChange(key, v)}
                className="[&>.relative>.absolute]:bg-emerald-500"
              />
            </div>
          ))}
          
          <Button onClick={handleSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 text-lg mt-4">
            ENVIAR VOTO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingPage;
