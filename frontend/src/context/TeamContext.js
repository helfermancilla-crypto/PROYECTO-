import React, { createContext, useContext, useState, useEffect } from 'react';
import { FORMATIONS_11, FORMATIONS_7 } from '@/lib/formations';

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [clubInfo, setClubInfo] = useState({
    name: 'MI EQUIPO FC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png'
  });
  
  // Default settings
  const defaultSettings = {
    mode: '11',
    formation: '4-3-3',
    color: 'green', 
    texture: 'striped',
    kitColor: '#ef4444',
    kitNumberColor: '#ffffff',
    viewMode: '2d',
  };

  const [pitchSettings, setPitchSettings] = useState(defaultSettings);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem('soccerBuilder_players');
      const savedPitch = localStorage.getItem('soccerBuilder_pitch');
      const savedClub = localStorage.getItem('soccerBuilder_club');
      
      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      
      if (savedPitch) {
        // Merge saved settings with defaults to ensure new fields (like mode) exist
        const parsedPitch = JSON.parse(savedPitch);
        setPitchSettings(prev => ({ ...prev, ...parsedPitch }));
      }
      
      if (savedClub) setClubInfo(JSON.parse(savedClub));
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('soccerBuilder_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('soccerBuilder_pitch', JSON.stringify(pitchSettings));
  }, [pitchSettings]);

  useEffect(() => {
    localStorage.setItem('soccerBuilder_club', JSON.stringify(clubInfo));
  }, [clubInfo]);

  const applyFormation = (formationName) => {
    const formations = pitchSettings.mode === '11' ? FORMATIONS_11 : FORMATIONS_7;
    const layout = formations[formationName];
    
    if (!layout) return;

    const updatedPlayers = players.map((player, index) => {
      if (index < layout.length) {
        return { ...player, position: { x: layout[index].x, y: layout[index].y } };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setPitchSettings(prev => ({ ...prev, formation: formationName }));
  };

  const addPlayer = (playerData) => {
    console.log("Adding player:", playerData);
    const formations = pitchSettings.mode === '11' ? FORMATIONS_11 : FORMATIONS_7;
    const currentLayout = formations[pitchSettings.formation] || [];
    const index = players.length;
    const defaultPos = index < currentLayout.length 
      ? { x: currentLayout[index].x, y: currentLayout[index].y } 
      : { x: 50, y: 50 };

    // Simple ID generator to avoid uuid dependency issues
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newPlayer = {
      id: newId,
      ...playerData,
      position: defaultPos,
      votes: [],
    };
    
    setPlayers(prev => [...prev, newPlayer]);
    console.log("Player added, new list length:", players.length + 1);
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
        const statsKeys = Object.keys(voteStats);
        const newStats = { ...p.stats };
        
        statsKeys.forEach(key => {
          const total = newVotes.reduce((sum, v) => sum + parseInt(v[key]), 0);
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
      if (data.pitchSettings) setPitchSettings(prev => ({ ...prev, ...data.pitchSettings }));
      if (data.clubInfo) setClubInfo(data.clubInfo);
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
      clubInfo,
      setClubInfo,
      addPlayer,
      updatePlayer,
      updatePlayerPosition,
      deletePlayer,
      addVote,
      importTeam,
      applyFormation
    }}>
      {children}
    </TeamContext.Provider>
  );
};
