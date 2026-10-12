import React from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

export default function Scene8() {
  const { currentScene, navigateTo, completeLevel2 } = useGame();
  const isActive = currentScene === 'scene-8';

  React.useEffect(() => {
    if (isActive) {
      completeLevel2();
      const t = setTimeout(() => {
        navigateTo('scene-10');
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isActive, completeLevel2, navigateTo]);

  const handleNextClick = () => {
    completeLevel2();
    soundController.playDoorOpenSound();
    navigateTo('scene-10');
  };

  return (
    <section id="scene-8" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Cave Background"
        className="chamber-bg"
      />

      <div
        className="map-screen-wrapper level3-map-wrapper"
        style={{ gap: '16px', maxWidth: '780px', padding: '20px 10px' }}
      >
        {/* 1. DANGEROUS WARNING MESSAGE */}
        <div
          className="completion-card-content"
          style={{
            maxWidth: '680px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 0 35px rgba(255, 51, 68, 0.65)',
            padding: '20px 24px',
          }}
        >
          <div className="skull-warning-icon" style={{ fontSize: '3rem', marginBottom: '6px' }}>
            ☠️
          </div>
          <h2 className="completion-danger-title" style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
            THE FINAL BOUNDARY OF SAFETY
          </h2>
          <p
            className="completion-danger-text"
            style={{ fontSize: '1.05rem', padding: '12px 16px', marginBottom: 0 }}
          >
            "YOU FOOLISHLY CHOSE THIS PATH! You have crossed the final boundary of safety. I am sending you straight into the depths of HELL. There is no turning back now!"
          </p>
        </div>

        {/* 2. GAME MAP WITH STANDING PIRATE GUARD */}
        <h1
          className="map-screen-title level3-unlocked-title"
          style={{ marginTop: '6px', marginBottom: '4px', fontSize: '1.8rem' }}
        >
          LEVEL 3 UNLOCKED
        </h1>

        <div className="framed-map-container level3-framed-container">
          <div className="gold-frame-border">
            <img
              src="/assets/images/treasure_map.jpg"
              alt="Ancient Pirate Treasure Map"
              className="unlocked-treasure-map"
            />
          </div>

          <div className="standing-pirate-wrapper">
            <img
              src="/assets/images/standing_pirate.png"
              alt="Standing Pirate Guard"
              className="standing-pirate-img"
            />
          </div>
        </div>

        {/* 3. NEXT BUTTON */}
        <div className="map-next-btn-container" style={{ marginTop: '6px' }}>
          <button
            id="level3-map-next-btn"
            className="next-btn clickable"
            onClick={handleNextClick}
            onMouseEnter={() => soundController.playHoverChime(580)}
            aria-label="Proceed to Level 3 Intro"
          >
            <span>PROCEED TO ROUND 3</span>
            <span className="next-btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </section>
  );
}
