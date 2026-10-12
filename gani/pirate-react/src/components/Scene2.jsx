import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

const FULL_INTRO_TEXT =
  "Three ancient doors stand before you. Each hides a trial designed to test your mind and courage. Choose wisely. Every decision brings you closer to the treasure... or deeper into danger.";

export default function Scene2() {
  const {
    currentScene,
    unlockedDoors,
    completedDoors,
    setSelectedDoor,
    flashNavigate,
    getNextTargetDoor,
    showToast,
  } = useGame();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isActive = currentScene === 'scene-2';

  useEffect(() => {
    if (!isActive) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < FULL_INTRO_TEXT.length) {
        setDisplayedText(FULL_INTRO_TEXT.substring(0, index + 1));
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

  const handleDoorHover = (doorId, isUnlocked) => {
    if (isUnlocked) {
      const freqMap = { door1: 440, door2: 550, door3: 660 };
      soundController.playHoverChime(freqMap[doorId] || 500);
    }
  };

  const handleDoorClick = (doorId, isUnlocked) => {
    if (!isUnlocked) {
      soundController.playErrorSound();
      showToast('This door is sealed by ancient magic! Solve earlier trials first.');
      return;
    }
    soundController.playDoorOpenSound();
    setSelectedDoor(doorId);
    flashNavigate('scene-3');
  };

  const handleNextClick = () => {
    soundController.playDoorOpenSound();
    const target = getNextTargetDoor();
    setSelectedDoor(target);
    flashNavigate('scene-3');
  };

  return (
    <section id="scene-2" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Ancient Cave Interior"
        className="level1-bg-image"
      />

      <div className="level1-content-wrapper">
        <header className="level1-header">
          <h1 className="level1-title">LEVEL 1</h1>
        </header>

        {/* Typewriter Introduction Box */}
        <div className="typewriter-card">
          <p className="typewriter-text" id="typewriter-text">
            {displayedText}
            {isTyping && <span className="typewriter-cursor"></span>}
          </p>
        </div>

        {/* Three Ancient Doors Grid */}
        <div
          className={`doors-container ${revealed ? 'revealed' : ''}`}
          id="doors-container"
        >
          {/* Door 1 (Crimson Stone) */}
          <article
            className={`door-card clickable ${!unlockedDoors.door1 ? 'locked' : ''} ${completedDoors.door1 ? 'solved' : ''}`}
            data-door="door1"
            role="button"
            tabIndex={0}
            onClick={() => handleDoorClick('door1', unlockedDoors.door1)}
            onMouseEnter={() => handleDoorHover('door1', unlockedDoors.door1)}
          >
            <img
              src="/assets/images/door1_crimson.jpg"
              alt="Ancient Crimson Stone Door"
              className="door-bg"
            />
            <div className="door-overlay"></div>
            <div className="door-info">
              <span className="door-tag">
                DOOR 1 {completedDoors.door1 ? '✓ COMPLETED' : ''}
              </span>
              <p className="door-inscription">"IF YOU DARE, TOUCH ME."</p>
              <span className="door-action-hint">✦ OPEN DOOR ✦</span>
            </div>
            {!unlockedDoors.door1 && <div className="lock-badge">🔒 LOCKED</div>}
          </article>

          {/* Door 2 (Wooden Pirate) */}
          <article
            className={`door-card clickable ${!unlockedDoors.door2 ? 'locked' : ''} ${completedDoors.door2 ? 'solved' : ''}`}
            data-door="door2"
            role="button"
            tabIndex={0}
            onClick={() => handleDoorClick('door2', unlockedDoors.door2)}
            onMouseEnter={() => handleDoorHover('door2', unlockedDoors.door2)}
          >
            <img
              src="/assets/images/door2_wooden.jpg"
              alt="Old Wooden Pirate Door"
              className="door-bg"
            />
            <div className="door-overlay"></div>
            <div className="door-info">
              <span className="door-tag">
                DOOR 2 {completedDoors.door2 ? '✓ COMPLETED' : ''}
              </span>
              <p className="door-inscription">"STEP CLOSER. FACE THE UNKNOWN."</p>
              <span className="door-action-hint">✦ OPEN DOOR ✦</span>
            </div>
            {!unlockedDoors.door2 && <div className="lock-badge">🔒 LOCKED</div>}
          </article>

          {/* Door 3 (Azure Gate) */}
          <article
            className={`door-card clickable ${!unlockedDoors.door3 ? 'locked' : ''} ${completedDoors.door3 ? 'solved' : ''}`}
            data-door="door3"
            role="button"
            tabIndex={0}
            onClick={() => handleDoorClick('door3', unlockedDoors.door3)}
            onMouseEnter={() => handleDoorHover('door3', unlockedDoors.door3)}
          >
            <img
              src="/assets/images/door3_azure.jpg"
              alt="Massive Azure Stone Gate"
              className="door-bg"
            />
            <div className="door-overlay"></div>
            <div className="door-info">
              <span className="door-tag">
                DOOR 3 {completedDoors.door3 ? '✓ COMPLETED' : ''}
              </span>
              <p className="door-inscription">"ONLY THE FEARLESS SHALL PASS."</p>
              <span className="door-action-hint">✦ OPEN DOOR ✦</span>
            </div>
            {!unlockedDoors.door3 && <div className="lock-badge">🔒 LOCKED</div>}
          </article>
        </div>

        {/* NEXT Button Below Doors */}
        <div
          className={`next-btn-container ${revealed ? 'revealed' : ''}`}
          id="next-btn-container"
        >
          <button
            id="next-btn"
            className="next-btn clickable"
            onClick={handleNextClick}
            onMouseEnter={() => soundController.playHoverChime(580)}
            aria-label="Open Next Question"
          >
            <span>NEXT TRIAL</span>
            <span className="next-btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </section>
  );
}
