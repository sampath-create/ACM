import React from 'react';
import { useGame } from '../hooks/useGame';

export default function AntiCheatRulesModal({ onAccept }) {
  const { rulesModalOpen, acceptRules } = useGame();

  if (!rulesModalOpen) return null;

  const handleAccept = () => {
    acceptRules();
    if (onAccept) onAccept();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(5, 7, 12, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 99990,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0e121e, #1a2236)',
          border: '2px solid rgba(212, 175, 55, 0.7)',
          borderRadius: '16px',
          padding: '36px 30px',
          maxWidth: '560px',
          width: '92%',
          textAlign: 'left',
          boxShadow: '0 0 45px rgba(212, 175, 55, 0.35)',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '12px' }}>
          📜
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-title)',
            color: '#ffd700',
            fontSize: '1.45rem',
            textAlign: 'center',
            letterSpacing: '2px',
            marginBottom: '20px',
          }}
        >
          ANCIENT PIRATE TRIAL RULES
        </h2>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            color: '#e8d8b8',
            fontSize: '0.98rem',
            lineHeight: '1.65',
            marginBottom: '26px',
          }}
        >
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <strong>Fair Play Oath:</strong> Tab switching or leaving the browser window is monitored. Accumulating 3 warnings marks dishonor.
            </li>
            <li>
              <strong>90-Minute Time Limit:</strong> You have 90 minutes to conquer all 4 rounds and claim the legendary pirate treasure before the cave gates seal forever!
            </li>
            <li>
              <strong>Progressive Unlocks:</strong> Solve Door 1 to unlock Door 2; conquer Door 2 to reveal Door 3.
            </li>
            <li>
              <strong>Grand Mystery:</strong> Four full rounds stand between you and the lost pirate treasure.
            </li>
          </ul>
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            className="proceed-btn clickable active"
            onClick={handleAccept}
            style={{
              padding: '14px 34px',
              fontSize: '1.05rem',
              letterSpacing: '1.5px',
            }}
          >
            I ACCEPT THE CHALLENGE ⚔️
          </button>
        </div>
      </div>
    </div>
  );
}
