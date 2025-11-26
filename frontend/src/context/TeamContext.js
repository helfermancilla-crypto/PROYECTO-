import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [pitchSettings, setPitchSettings] = useState({
    mode: '11', // '11' or '7'
    color: 'green', // 'green', 'red', 'blue', 'black'
    texture: 'striped', // 'striped', 'checkered', 'plain'
    kitColor: '#ef4444', // Default red kit
    kitNumberColor: '#ffffff', // Default white numbers
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('soccerBuilder_players');
    const savedPitch = localStorage.getItem('soccerBuilder_pitch');
    
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedPitch) setPitchSettings(JSON.parse(savedPitch));
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('soccerBuilder_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('soccerBuilder_pitch', JSON.stringify(pitchSettings));
  }, [pitchSettings]);

  const addPlayer = (playerData) => {
    const newPlayer = {
      id: uuidv4(),
      ...playerData,
      position: { x: 50, y: 50 }, // Default center
      votes: [], // Array of vote objects
    };
    setPlayers([...players, newPlayer]);
  };

  const updatePlayer = (id, updatedData) => {
    setPlayers(players.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const updatePlayerPosition = (id, position) => {
    setPlayers(players.map(p => p.id === id ? { ...p, position } : p));
  };

  const deletePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const addVote = (playerId, voteStats) => {
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        const newVotes = [...(p.votes || []), voteStats];
        
        // Recalculate averages
        const statsKeys = Object.keys(voteStats);
        const newStats = { ...p.stats };
        
        statsKeys.forEach(key => {
          const total = newVotes.reduce((sum, v) => sum + parseInt(v[key]), 0);
          const initialValue = parseInt(p.initialStats?.[key] || p.stats[key]); 
          newStats[key] = Math.round(total / newVotes.length);
        });

        return { ...p, votes: newVotes, stats: newStats };
      }
      return p;
    }));
  };

  const importTeam = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.players) setPlayers(data.players);
      if (data.pitchSettings) setPitchSettings(data.pitchSettings);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <TeamContext.Provider value={{
      players,
      pitchSettings,
      setPitchSettings,
      addPlayer,
      updatePlayer,
      updatePlayerPosition,
      deletePlayer,
      addVote,
      importTeam
    }}>
      {children}
    </TeamContext.Provider>
  );
};
