import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTeam } from '../context/TeamContext';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const VotingPage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { players, addVote } = useTeam();
  const [player, setPlayer] = useState(null);
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // In a real app, we'd fetch from DB. 
    // Here we look in local storage via context.
    // If the user is on a different device, this won't work (as per prompt constraints/solution).
    // We will simulate "loading" the player data.
    const found = players.find(p => p.id === playerId);
    if (found) {
      setPlayer(found);
      setVotes(found.stats); // Initialize with current stats
    }
  }, [playerId, players]);

  const handleVoteChange = (stat, value) => {
    setVotes(prev => ({ ...prev, [stat]: value[0] }));
  };

  const handleSubmit = () => {
    addVote(playerId, votes);
    setSubmitted(true);
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
              Gracias por votar en las estadísticas de {player.name}. Los promedios se han actualizado localmente.
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
