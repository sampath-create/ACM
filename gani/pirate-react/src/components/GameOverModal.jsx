import React from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

export default function GameOverModal() {
  const { gameOver, gameOverReason, resetGame, timeLeft } = useGame();

  if (!gameOver) return null;

  const isDisqualified = gameOverReason === 'warnings_exceeded';
  const isTimeExpired = gameOverReason === 'time_expired';

  // Format time as MM:SS (e.g., 58:32)
  const formatTimeMMSS = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const recordedTime = formatTimeMMSS(timeLeft);
  const abortFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeUpUa8EBYo9gbR0QG6Xt0KFcRvUIhFNLBKexNiA_nIYD3ucA/viewform?usp=pp_url&entry.637509370=${encodeURIComponent(recordedTime)}`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(3, 2, 5, 0.94)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease-out',
        padding: '20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #180508, #2e080e)',
          border: '2px solid #ff2a4b',
          borderRadius: '16px',
          padding: '36px 28px',
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(255, 42, 75, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.8)',
          animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        <div style={{ fontSize: '4.2rem', marginBottom: '12px', filter: 'drop-shadow(0 0 20px #ff2a4b)' }}>
          {isDisqualified ? '⚡' : isTimeExpired ? '⏳' : '☠️'}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-title)',
            color: '#ff2a4b',
            fontSize: '1.75rem',
            letterSpacing: '2px',
            marginBottom: '14px',
            textShadow: '0 0 20px rgba(255, 42, 75, 0.8)',
          }}
        >
          {isDisqualified
            ? 'DISQUALIFIED BY THE GUARDIANS'
            : isTimeExpired
            ? 'THE 90-MINUTE TIME HAS EXPIRED'
            : 'YOU PERISHED IN THE CAVE'}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: '#e8d8b8',
            fontSize: '1rem',
            lineHeight: '1.5',
            marginBottom: '20px',
          }}
        >
          {isDisqualified
            ? 'You switched tabs or left the cave window 3 times, violating the Sacred Pirate Trial Oath. The cave gates slam shut forever!'
            : isTimeExpired
            ? 'The 90-minute sands of time have completely run dry! The ancient cave gates have sealed shut forever.'
            : 'Ancient curses and treacherous trials have claimed your soul.'}
        </p>

        {/* Recorded Time Badge */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 42, 75, 0.4)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ color: '#ff8a9e', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
            Recorded Time:
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: '#ffd700',
              background: 'rgba(255, 215, 0, 0.12)',
              padding: '3px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            }}
          >
            ⏱️ {recordedTime}
          </span>
        </div>

        {/* Action Button for Form */}
        <a
          href={abortFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #ff2a4b 0%, #a8001e 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '1.05rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textDecoration: 'none',
            border: '2px solid #ff7b92',
            boxShadow: '0 0 25px rgba(255, 42, 75, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 42, 75, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 42, 75, 0.6)';
          }}
        >
          <span>📋 FILL TRIAL REPORT FORM</span>
          <span style={{ fontSize: '1.2rem' }}>➔</span>
        </a>

        <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#ffb3c0', opacity: 0.85 }}>
          Your time (<strong>{recordedTime}</strong>) is prefilled automatically in the form.
        </div>
      </div>
    </div>
  );
}
