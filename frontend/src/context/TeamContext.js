import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FORMATIONS_11, FORMATIONS_7 } from '@/lib/formations';
import axios from 'axios';
import { toast } from "sonner";

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const TeamProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [clubInfo, setClubInfo] = useState({
    name: 'MI EQUIPO FC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png'
  });
  
  const defaultSettings = {
    mode: '11',
    formation: '4-3-3 (11v11)',
    color: 'green', 
    texture: 'striped',
    kitColor: '#ef4444',
    kitNumberColor: '#ffffff',
    cardColor: '#1e293b', // Default dark card
    cardTexture: 'silk', // silk, mesh
    viewMode: '2d',
  };

  const [pitchSettings, setPitchSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`${API_URL}/team`);
        const data = response.data;
        
        if (data) {
          setPlayers(data.players || []);
          setPitchSettings(prev => ({ ...prev, ...data.pitchSettings }));
          setClubInfo(prev => ({ ...prev, ...data.clubInfo }));
        }
      } catch (error) {
        console.error("Error fetching team:", error);
        // toast.error("Error al cargar el equipo desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  // Save to API whenever state changes (Debounced)
  const isLoaded = React.useRef(false);

  useEffect(() => {
    if (!loading) {
      isLoaded.current = true;
    }
  }, [loading]);

  const saveTeam = useCallback(async (currentPlayers, currentPitch, currentClub) => {
    if (!isLoaded.current) return;
    
    try {
      await axios.post(`${API_URL}/team`, {
        players: currentPlayers,
        pitchSettings: currentPitch,
        clubInfo: currentClub
      });
    } catch (error) {
      console.error("Error saving team:", error);
    }
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
      const timeoutId = setTimeout(() => {
        saveTeam(players, pitchSettings, clubInfo);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [players, pitchSettings, clubInfo, saveTeam]);


  const applyFormation = (formationName) => {
    const layout = FORMATIONS_11[formationName] || FORMATIONS_7[formationName];
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

  const changeMode = (newMode) => {
    try {
      const defaultFormation = newMode === '11' ? '4-4-2 (11v11)' : '3-2-1 (7v7)';
      const formations = newMode === '11' ? FORMATIONS_11 : FORMATIONS_7;
      const layout = formations[defaultFormation];
      
      if (!layout) return;

      const updatedPlayers = players.map((player, index) => {
        if (index < layout.length) {
          return { ...player, position: { x: layout[index].x, y: layout[index].y } };
        }
        return player;
      });

      setPlayers(updatedPlayers);
      setPitchSettings(prev => ({ ...prev, mode: newMode, formation: defaultFormation }));
    } catch (error) {
      console.error("Error changing mode:", error);
    }
  };

  const addPlayer = (playerData) => {
    const formations = pitchSettings.mode === '11' ? FORMATIONS_11 : FORMATIONS_7;
    const currentLayout = formations[pitchSettings.formation] || [];
    const index = players.length;
    const defaultPos = index < currentLayout.length 
      ? { x: currentLayout[index].x, y: currentLayout[index].y } 
      : { x: 50, y: 50 };

    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    const newPlayer = {
      id: newId,
      ...playerData,
      position: defaultPos,
      votes: [],
    };
    
    setPlayers(prev => [...prev, newPlayer]);
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

  const addVote = async (playerId, voteStats) => {
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
    
    try {
        await axios.post(`${API_URL}/player/${playerId}/vote`, voteStats);
    } catch (e) {
        console.error("Error submitting vote", e);
    }
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
      applyFormation,
      changeMode,
      loading
    }}>
      {children}
    </TeamContext.Provider>
  );
};
