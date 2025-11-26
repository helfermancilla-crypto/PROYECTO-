import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TeamProvider } from './context/TeamContext';
import Home from './pages/Home';
import VotingPage from './components/VotingPage';
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

function App() {
  return (
    <TeamProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vote/:playerId" element={<VotingPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" theme="dark" />
    </TeamProvider>
  );
}

export default App;
