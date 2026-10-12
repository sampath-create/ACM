import React from 'react';
import { useGame } from '../hooks/useGame';

export default function FlashOverlay() {
  const { flashActive } = useGame();

  return (
    <>
      <div className="vignette-overlay" />
      <div className="fog-layer" />
      <div id="flash-overlay" className={flashActive ? 'active' : ''} />
    </>
  );
}
