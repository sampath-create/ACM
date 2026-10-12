import React from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

export default function HUD() {
  const {
    isMuted,
    toggleAudio,
    warningCount,
    toastVisible,
    toastMessage,
    currentScene,
    goToRound,
    timeLeft = 5400,
  } = useGame();

  const formatTime = (seconds) => {
    const total = Math.max(0, seconds || 0);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAudioHover = () => {
    soundController.playHoverChime(500);
  };

  return (
    <>
      {/* Top-Left Audio Control HUD */}
      <div className="audio-control-hud">
        <button
          id="toggle-audio-btn"
          className="audio-btn clickable"
          title="Toggle Sound Ambience"
          onClick={toggleAudio}
          onMouseEnter={handleAudioHover}
        >
          <svg className="audio-icon" viewBox="0 0 24 24">
            {isMuted ? (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            )}
          </svg>
          <span id="audio-status-text">{isMuted ? 'SOUND: OFF' : 'SOUND: ON'}</span>
        </button>
      </div>



      {/* Top-Right HUD: Timer & Warnings */}
      <div className="hud-container">
        <div
          className={`timer-card ${timeLeft <= 300 ? 'timer-critical' : timeLeft <= 900 ? 'timer-warning' : ''}`}
          id="timer-hud"
          title="Total Time Remaining (90 Minutes Limit)"
        >
          <span className="timer-icon">⏳</span>
          <span id="timer-hud-text" className="timer-text">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div
          className={`warning-card ${warningCount > 0 ? 'has-warnings' : ''}`}
          id="warning-hud"
          title="Cave Rules Violation Counter"
        >
          <span className="warning-icon">{warningCount > 3 ? '☠️' : '⚠️'}</span>
          <span id="warning-hud-text" className="warning-text">
            WARNINGS {warningCount}/3
          </span>
        </div>
      </div>

      {/* Toast Alert Notification */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(25, 10, 15, 0.95)',
            border: '2px solid #ff2a4b',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(255, 42, 75, 0.6)',
            fontFamily: 'var(--font-title)',
            letterSpacing: '1px',
            fontSize: '0.95rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'toastPop 0.3s ease-out',
            textAlign: 'center',
          }}
        >
          <span>☠️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
