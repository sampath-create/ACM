import React from 'react';
import { GameProvider } from './context/GameContext';
import ParticleCanvas from './components/ParticleCanvas';
import FlashOverlay from './components/FlashOverlay';
import HUD from './components/HUD';
import AntiCheatRulesModal from './components/AntiCheatRulesModal';
import GameOverModal from './components/GameOverModal';
import Scene1 from './components/Scene1';
import Scene2 from './components/Scene2';
import Scene3 from './components/Scene3';
import Scene4 from './components/Scene4';
import Scene5 from './components/Scene5';
import Scene6 from './components/Scene6';
import Scene7 from './components/Scene7';
import Scene8 from './components/Scene8';
import Scene9 from './components/Scene9';
import Scene10 from './components/Scene10';

function GameContent() {
  return (
    <>
      <ParticleCanvas />
      <FlashOverlay />
      <HUD />
      <AntiCheatRulesModal />
      <GameOverModal />

      <main className="game-container">
        <Scene1 />
        <Scene2 />
        <Scene3 />
        <Scene4 />
        <Scene5 />
        <Scene6 />
        <Scene7 />
        <Scene8 />
        <Scene9 />
        <Scene10 />
      </main>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
