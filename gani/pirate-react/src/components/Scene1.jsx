import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

export default function Scene1() {
  const {
    currentScene,
    navigateTo,
    setFlashActive,
    gameStarted,
    startGame,
    openRulesModal,
  } = useGame();

  const [isOpening, setIsOpening] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  const isActive = currentScene === 'scene-1';

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      setIsZooming(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      setIsZooming(false);
      setIsOpening(false);
    };
  }, [isActive]);

  const handleEnterHover = () => {
    soundController.init();
    soundController.playHoverChime(520);
  };

  const proceedThroughGate = () => {
    setIsOpening(true);
    soundController.init();
    soundController.playDoorOpenSound();

    setTimeout(() => {
      setFlashActive(true);
    }, 1200);

    setTimeout(() => {
      startGame();
      navigateTo('scene-2');
      setFlashActive(false);
      setIsOpening(false);
    }, 2000);
  };

  const handleEnterClick = () => {
    if (isOpening) return;

    if (!gameStarted) {
      openRulesModal(() => {
        proceedThroughGate();
      });
      return;
    }

    proceedThroughGate();
  };

  return (
    <section
      id="scene-1"
      className={`scene ${isActive ? 'active' : ''} ${isZooming ? 'zooming' : ''} ${isOpening ? 'opening' : ''}`}
    >
      <div className="cave-camera-viewport">
        <img
          src="/assets/images/cave_entrance.jpg"
          alt="Ancient Mysterious Cave Door"
          className="cave-bg-image"
          id="cave-entrance-img"
        />
      </div>

      <div className="door-content-overlay">
        <div className="ancient-warning-box">
          <h1 className="warning-text">BEYOND THIS GATE, EVEN COURAGE TREMBLES.</h1>
        </div>

        <div className="enter-invitation-container">
          <button
            id="enter-btn"
            className="enter-btn clickable"
            onClick={handleEnterClick}
            onMouseEnter={handleEnterHover}
          >
            <span className="enter-btn-glow-ring"></span>
            ENTER IF YOU DARE
          </button>
        </div>
      </div>
    </section>
  );
}
