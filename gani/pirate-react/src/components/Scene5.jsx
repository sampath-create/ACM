import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

const LEVEL2_INTRO_TEXT =
  "Beyond this cursed map lie the Bloody Bridge and the Raged River. Only those who conquer the ancient puzzles shall survive the journey.";

export default function Scene5() {
  const { currentScene, flashNavigate } = useGame();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isActive = currentScene === 'scene-5';

  useEffect(() => {
    if (!isActive) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < LEVEL2_INTRO_TEXT.length) {
        setDisplayedText(LEVEL2_INTRO_TEXT.substring(0, index + 1));
        setIsTyping(true);
        if (index % 2 === 0) {
          soundController.playTypewriterTick();
        }
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => {
          setRevealed(true);
          soundController.playHoverChime(660);
        }, 500);
      }
    }, 28);

    return () => {
      clearInterval(interval);
      setDisplayedText('');
      setRevealed(false);
      setIsTyping(false);
    };
  }, [isActive]);

  const handleNextClick = () => {
    soundController.playDoorOpenSound();
    flashNavigate('scene-6');
  };

  return (
    <section id="scene-5" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Level 2 Background"
        className="chamber-bg"
      />

      <div className="level2-content-wrapper">
        <header className="level1-header">
          <h1 className="level1-title">LEVEL 2</h1>
        </header>

        <div className="typewriter-card level2-typewriter-card">
          <p className="typewriter-text" id="level2-typewriter-text">
            {displayedText}
            {isTyping && <span className="typewriter-cursor"></span>}
          </p>
        </div>

        <div
          className={`challenge-cards-container ${revealed ? 'revealed' : ''}`}
          id="challenge-cards-container"
        >
          <article
            className="challenge-card"
            id="card-bloody-bridge"
            onMouseEnter={() => soundController.playHoverChime(440)}
          >
            <div className="card-image-wrapper">
              <img
                src="/assets/images/bloody_bridge.jpg"
                alt="Bloody Bridge"
                className="card-img"
              />
              <div className="card-overlay"></div>
            </div>
            <h2 className="card-title">BLOODY BRIDGE</h2>
          </article>

          <article
            className="challenge-card"
            id="card-raged-river"
            onMouseEnter={() => soundController.playHoverChime(550)}
          >
            <div className="card-image-wrapper">
              <img
                src="/assets/images/raged_river.jpg"
                alt="Raged River"
                className="card-img"
              />
              <div className="card-overlay"></div>
            </div>
            <h2 className="card-title">RAGED RIVER</h2>
          </article>
        </div>

        <div
          className={`level2-next-container ${revealed ? 'revealed' : ''}`}
          id="level2-next-container"
        >
          <button
            id="level2-next-btn"
            className="next-btn clickable"
            onClick={handleNextClick}
            onMouseEnter={() => soundController.playHoverChime(580)}
            aria-label="Proceed to Sudoku Challenge"
          >
            <span>NEXT CHALLENGE</span>
            <span className="next-btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </section>
  );
}
