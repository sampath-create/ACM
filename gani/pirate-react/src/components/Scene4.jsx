import React from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

export default function Scene4() {
  const { currentScene, flashNavigate } = useGame();
  const isActive = currentScene === 'scene-4';

  React.useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        flashNavigate('scene-6');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isActive, flashNavigate]);

  const handleNextClick = () => {
    soundController.playDoorOpenSound();
    flashNavigate('scene-6');
  };

  return (
    <section id="scene-4" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Cave Background"
        className="chamber-bg"
      />

      <div className="map-screen-wrapper">
        <h1 className="map-screen-title">
          Congratulations, Pirate! The Treasure Map Is Unlocked!
        </h1>

        <div className="framed-map-container">
          <div className="gold-frame-border">
            <img
              src="/assets/images/treasure_map.jpg"
              alt="Ancient Pirate Treasure Map"
              className="unlocked-treasure-map"
            />
          </div>
        </div>

        <div className="map-next-btn-container">
          <button
            id="map-next-btn"
            className="next-btn clickable"
            onClick={handleNextClick}
            onMouseEnter={() => soundController.playHoverChime(580)}
            aria-label="Proceed to Round 2"
          >
            <span>PROCEED TO ROUND 2</span>
            <span className="next-btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </section>
  );
}
