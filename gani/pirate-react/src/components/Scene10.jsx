import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';
import { TERRITORIES } from '../data/territories34';
import { MAP_SCENARIOS } from '../data/mapScenarios';

// 4 Pirate Factions / Colors
const PALETTE_COLORS = [
  { id: 'crimson', name: 'Crimson Ruby', color: '#e11d48', hover: '#f43f5e', key: '1' },
  { id: 'sapphire', name: 'Ocean Sapphire', color: '#0284c7', hover: '#38bdf8', key: '2' },
  { id: 'emerald', name: 'Emerald Jade', color: '#059669', hover: '#34d399', key: '3' },
  { id: 'gold', name: 'Golden Topaz', color: '#d97706', hover: '#fbbf24', key: '4' },
];

const DEFAULT_TERRITORY_FILL = '#1e293b';

export default function Scene10() {
  const { currentScene, resetGame, goToRound, activeMapScenario, timeLeft, score } = useGame();
  const isActive = currentScene === 'scene-10';

  const currentScenario = activeMapScenario || MAP_SCENARIOS[0];

  // Selected painting tool: 'crimson' | 'sapphire' | 'emerald' | 'gold' | 'eraser'
  const [selectedColor, setSelectedColor] = useState('crimson');

  // Coloring state: map of territoryId -> colorId
  const [territoryColors, setTerritoryColors] = useState(() => currentScenario.initialColors || {});

  // History for Undo
  const [history, setHistory] = useState([]);

  // Sync when activeMapScenario changes
  useEffect(() => {
    setTerritoryColors(currentScenario.initialColors || {});
    setHistory([]);
    setFeedback({ text: '', type: '' });
  }, [currentScenario.id]);

  // Hovered territory
  const [hoveredId, setHoveredId] = useState(null);

  // User feedback banner
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Victory modal state
  const [grandVictory, setGrandVictory] = useState(false);

  // Compute active border conflicts
  const conflicts = useMemo(() => {
    const list = [];
    const checkedPairs = new Set();

    TERRITORIES.forEach((t) => {
      const c1 = territoryColors[t.id];
      if (!c1) return;

      t.neighbors.forEach((nbrId) => {
        const pairKey = [t.id, nbrId].sort().join('-');
        if (checkedPairs.has(pairKey)) return;
        checkedPairs.add(pairKey);

        const c2 = territoryColors[nbrId];
        if (c2 && c1 === c2) {
          const segment = t.borderSegments?.[nbrId];
          const nbrTerritory = TERRITORIES.find((item) => item.id === nbrId);
          list.push({
            t1: t.id,
            t2: nbrId,
            t1Name: t.name,
            t2Name: nbrTerritory?.name || nbrId,
            color: c1,
            segment,
          });
        }
      });
    });

    return list;
  }, [territoryColors]);

  const conflictingTerritoryIds = useMemo(() => {
    const ids = new Set();
    conflicts.forEach((c) => {
      ids.add(c.t1);
      ids.add(c.t2);
    });
    return ids;
  }, [conflicts]);

  const coloredCount = Object.keys(territoryColors).filter(
    (k) => territoryColors[k] !== undefined && territoryColors[k] !== null
  ).length;

  // Keyboard shortcut listener (1, 2, 3, 4, e, z)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') setSelectedColor('crimson');
      if (e.key === '2') setSelectedColor('sapphire');
      if (e.key === '3') setSelectedColor('emerald');
      if (e.key === '4') setSelectedColor('gold');
      if (e.key.toLowerCase() === 'e') setSelectedColor('eraser');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, history]);

  // Click territory handler
  const handleTerritoryClick = useCallback(
    (territoryId) => {
      const currentColor = territoryColors[territoryId];

      if (selectedColor === 'eraser') {
        if (!currentColor) return;
        soundController.playKeypadClick();
        setHistory((prev) => [...prev, territoryColors]);
        setTerritoryColors((prev) => {
          const next = { ...prev };
          delete next[territoryId];
          return next;
        });
        return;
      }

      if (currentColor === selectedColor) return;

      soundController.playKeypadClick();
      setHistory((prev) => [...prev, territoryColors]);
      setTerritoryColors((prev) => ({
        ...prev,
        [territoryId]: selectedColor,
      }));

      // Immediate conflict check on newly colored territory
      const target = TERRITORIES.find((t) => t.id === territoryId);
      if (target) {
        const hasConflictWithNeighbor = target.neighbors.some(
          (nid) => territoryColors[nid] === selectedColor
        );
        if (hasConflictWithNeighbor) {
          soundController.playErrorSound();
          setFeedback({
            text: `⚠️ Border Dispute! ${target.name} touches another territory with the same flag!`,
            type: 'error',
          });
        } else {
          setFeedback({ text: '', type: '' });
        }
      }
    },
    [selectedColor, territoryColors]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    soundController.playKeypadClick();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setTerritoryColors(previous);
  };

  const handleClearMap = () => {
    soundController.playHoverChime(380);
    setHistory((prev) => [...prev, territoryColors]);
    setTerritoryColors(currentScenario.initialColors || {});
    setFeedback({ text: 'Archipelago map reset to initial treaty state.', type: 'warning' });
  };

  const handleHint = () => {
    soundController.playHoverChime(520);
    if (conflicts.length > 0) {
      const first = conflicts[0];
      setFeedback({
        text: `💡 Conflict between ${first.t1Name} and ${first.t2Name}! Change one of their colors.`,
        type: 'error',
      });
      return;
    }

    const uncolored = TERRITORIES.find((t) => !territoryColors[t.id]);
    if (!uncolored) {
      setFeedback({ text: 'All 34 territories claimed! Click CHECK MAP to verify.', type: 'success' });
      return;
    }

    const neighborColors = new Set(
      uncolored.neighbors.map((nid) => territoryColors[nid]).filter(Boolean)
    );
    const available = PALETTE_COLORS.find((p) => !neighborColors.has(p.id));

    if (available) {
      setHistory((prev) => [...prev, territoryColors]);
      setTerritoryColors((prev) => ({
        ...prev,
        [uncolored.id]: available.id,
      }));
      setFeedback({
        text: `💡 Tactical Hint: Assigned ${uncolored.name} to ${available.name}!`,
        type: 'success',
      });
    } else {
      setFeedback({
        text: `💡 Re-adjust colors around ${uncolored.name} to create an opening!`,
        type: 'warning',
      });
    }
  };

  const handleCheckMap = () => {
    if (coloredCount < TERRITORIES.length) {
      soundController.playErrorSound();
      setFeedback({
        text: `Unfinished treaty! Only ${coloredCount}/${TERRITORIES.length} territories painted. Claim all 34 islands!`,
        type: 'warning',
      });
      return;
    }

    if (conflicts.length > 0) {
      soundController.playErrorSound();
      setFeedback({
        text: `War Alert! ${conflicts.length} border conflict${conflicts.length > 1 ? 's' : ''} detected! Bordering territories cannot share the same color.`,
        type: 'error',
      });
      return;
    }

    // 100% Valid 4-Coloring Solved!
    soundController.playSuccessChime();
    setFeedback({
      text: 'PERFECT 4-COLORING! All 34 pirate territories are in complete harmony!',
      type: 'success',
    });
    setTimeout(() => {
      setGrandVictory(true);
    }, 1200);
  };

  if (!isActive) return null;

  return (
    <section id="scene-10" className={`scene ${isActive ? 'active' : ''}`} style={{ display: 'flex', zIndex: 30 }}>
      {/* Background Cave/Map Overlay */}
      <img src="/assets/images/cave_level1_bg.jpg" alt="Level 3 Background" className="chamber-bg" />

      <div className="scene10-container">
        {/* HEADER */}
        <header className="scene10-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: '#ffd24c',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700,
              padding: '4px 14px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 210, 76, 0.35)',
              width: 'fit-content',
              margin: '0 auto 10px auto',
            }}
          >
            <span>📜</span>
            <span>SET {currentScenario.setIndex}: {currentScenario.name}</span>
          </div>
          <h1 className="scene10-title">⚡ ROUND 3: THE GREAT ARCHIPELAGO (34 REGIONS)</h1>
          <p className="scene10-subtitle">
            {currentScenario.description}
          </p>
        </header>

        {/* TOP STATUS & CONTROL BAR */}
        <div className="scene10-controls-bar">
          {/* PALETTE SELECTOR */}
          <div className="palette-container">
            <span className="palette-label">FACTION COLOR:</span>
            <div className="color-swatches-group">
              {PALETTE_COLORS.map((p) => {
                const isSelected = selectedColor === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`swatch-btn ${isSelected ? 'active' : ''}`}
                    style={{ '--swatch-color': p.color }}
                    onClick={() => {
                      soundController.playKeypadClick();
                      setSelectedColor(p.id);
                    }}
                    title={`Select ${p.name} (Key: ${p.key})`}
                  >
                    <span className="swatch-circle" style={{ backgroundColor: p.color }} />
                    <span>{p.name.split(' ')[0]}</span>
                    <span className="swatch-key-badge">{p.key}</span>
                  </button>
                );
              })}

              {/* ERASER TOOL */}
              <button
                type="button"
                className={`swatch-btn eraser-btn ${selectedColor === 'eraser' ? 'active' : ''}`}
                onClick={() => {
                  soundController.playKeypadClick();
                  setSelectedColor('eraser');
                }}
                title="Eraser tool (Key: E)"
              >
                <span>🧹 ERASE</span>
                <span className="swatch-key-badge">E</span>
              </button>
            </div>
          </div>

          {/* STATUS COUNTERS */}
          <div className="status-badges-group">
            <div className="status-badge progress-badge">
              <span>🗺️ {coloredCount} / {TERRITORIES.length} CLAIMED</span>
            </div>
            <div className={`status-badge conflict-badge ${conflicts.length > 0 ? 'has-conflicts' : 'clean'}`}>
              <span>{conflicts.length > 0 ? `⚠️ ${conflicts.length} CONFLICT${conflicts.length > 1 ? 'S' : ''}` : '✓ 0 CONFLICTS'}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="map-actions-group">
            <button type="button" className="map-action-btn" onClick={handleHint} title="Tactical Hint">
              💡 HINT
            </button>
            <button type="button" className="map-action-btn" onClick={handleUndo} disabled={history.length === 0} title="Undo last territory color">
              ⎌ UNDO
            </button>
            <button type="button" className="map-action-btn" onClick={handleClearMap} title="Reset all colored islands">
              🔄 RESET
            </button>
            <button type="button" className="map-action-btn check-map-btn" onClick={handleCheckMap} title="Verify map borders">
              ⚡ CHECK MAP
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback.text && (
          <div className={`scene10-feedback-banner ${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        {/* MAIN INTERACTIVE MAP CARD */}
        <div className="archipelago-map-card">
          <svg
            viewBox="0 0 1600 920"
            className="archipelago-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* SVG Defs for gradients and glow filters */}
            <defs>
              <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f2642" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#040b17" stopOpacity="0.98" />
              </radialGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Texture Grid Background */}
            <rect x="0" y="0" width="1600" height="920" fill="url(#oceanGlow)" />

            {/* Sea contour depth rings (aesthetic pirate chart details) */}
            <circle cx="800" cy="460" r="380" fill="none" stroke="rgba(255, 215, 0, 0.05)" strokeWidth="1.5" strokeDasharray="4 8" />
            <circle cx="800" cy="460" r="580" fill="none" stroke="rgba(255, 215, 0, 0.03)" strokeWidth="1.5" strokeDasharray="6 12" />

            {/* Compass Rose in Corner */}
            <g transform="translate(45, 45) scale(0.55)" className="compass-rose">
              <circle cx="0" cy="0" r="45" fill="none" stroke="#ffd700" strokeWidth="1.5" />
              <polygon points="0,-40 6,-8 0,0 -6,-8" fill="#ffd700" />
              <polygon points="0,40 6,8 0,0 -6,8" fill="#c084fc" />
              <polygon points="-40,0 -8,-6 0,0 -8,6" fill="#38bdf8" />
              <polygon points="40,0 8,-6 0,0 8,6" fill="#38bdf8" />
              <text x="0" y="-46" textAnchor="middle" fill="#ffd700" fontSize="13" fontWeight="bold">N</text>
            </g>

            {/* Pirate Galleon Deco in Eastern Ocean */}
            <g transform="translate(1540, 870) scale(0.85)" className="map-ship-icon">
              <text x="0" y="0" fontSize="24">⛵</text>
            </g>

            {/* Sea Monster Deco in Western Ocean */}
            <g transform="translate(35, 875) scale(0.85)" className="map-sea-monster">
              <text x="0" y="0" fontSize="24">🐙</text>
            </g>

            {/* TERRITORY POLYGONS */}
            {TERRITORIES.map((t) => {
              const colorId = territoryColors[t.id];
              const paletteItem = PALETTE_COLORS.find((p) => p.id === colorId);
              const fillColor = paletteItem ? paletteItem.color : DEFAULT_TERRITORY_FILL;
              const hasConflict = conflictingTerritoryIds.has(t.id);

              return (
                <polygon
                  key={t.id}
                  points={t.points}
                  className={`map-territory ${hasConflict ? 'conflict-blink' : ''}`}
                  fill={fillColor}
                  opacity={colorId ? 0.92 : 0.65}
                  onClick={() => handleTerritoryClick(t.id)}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}

            {/* CONFLICT BORDER HIGHLIGHT LINES */}
            {conflicts.map((c, idx) => {
              if (!c.segment) return null;
              return (
                <g key={`conflict-${idx}`}>
                  <line
                    x1={c.segment.x1}
                    y1={c.segment.y1}
                    x2={c.segment.x2}
                    y2={c.segment.y2}
                    className="conflict-border-line"
                  />
                  {/* Warning pulse emoji icon at midpoint */}
                  <circle
                    cx={(c.segment.x1 + c.segment.x2) / 2}
                    cy={(c.segment.y1 + c.segment.y2) / 2}
                    r="11"
                    fill="#ff2233"
                    stroke="#fff"
                    strokeWidth="1.5"
                    filter="url(#goldGlow)"
                  />
                  <text
                    x={(c.segment.x1 + c.segment.x2) / 2}
                    y={(c.segment.y1 + c.segment.y2) / 2 + 3.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fill="#fff"
                    fontWeight="bold"
                  >
                    ✕
                  </text>
                </g>
              );
            })}

            {/* TERRITORY LABELS */}
            {TERRITORIES.map((t) => {
              const colorId = territoryColors[t.id];
              const paletteItem = PALETTE_COLORS.find((p) => p.id === colorId);
              const hasConflict = conflictingTerritoryIds.has(t.id);

              return (
                <g key={`label-${t.id}`} className="territory-label-group" transform={`translate(${t.center.x}, ${t.center.y})`}>
                  <rect
                    x="-56"
                    y="-16"
                    width="112"
                    height="32"
                    rx="5"
                    className="territory-label-bg"
                    stroke={hasConflict ? '#ff3344' : paletteItem ? paletteItem.color : 'rgba(255, 215, 0, 0.45)'}
                    strokeWidth={hasConflict ? '2' : '1'}
                  />
                  <text x="0" y="-3.5" className="territory-label-text">
                    {t.name}
                  </text>
                  <text x="0" y="8.5" className="territory-sub-text" fill={paletteItem ? paletteItem.color : '#ffd700'}>
                    {paletteItem ? paletteItem.name.toUpperCase() : '[ UNCLAIMED ]'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ROUND 3 VICTORY MODAL OVERLAY */}
      {grandVictory && (() => {
        const formatTimeMMSS = (seconds) => {
          const total = Math.max(0, Math.floor(seconds || 0));
          const mins = Math.floor(total / 60);
          const secs = total % 60;
          return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        };
        const victoryTime = formatTimeMMSS(timeLeft);
        const finalScore = score !== undefined ? score : 80;
        const victoryFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdaJMwpRA70KYBSXz-iNlo4TzbpRen17s69Vzon-60zVg_c8A/viewform?usp=pp_url&entry.637509370=${encodeURIComponent(victoryTime)}&entry.1974378786=${encodeURIComponent(finalScore)}`;

        return (
          <div className="grand-victory-modal-overlay">
            <div className="grand-victory-card">
              <div className="grand-victory-emoji-row">
                🏆🗺️👑💎
              </div>
              <h1 className="grand-victory-title">ROUND 3 CONQUERED! ALL 34 TERRITORIES UNITED!</h1>
              <p className="grand-victory-text">
                "By using 4 faction flags to resolve every border dispute across all 34 territories of the Great Archipelago with zero conflicts, you have proved your tactical genius! The ancient inner sanctum now unlocks—prepare for the final Pirate Vault Cipher in Round 4!"
              </p>
              <div className="grand-badge-box">
                ⭐ GRAND MASTER OF THE 34-TERRITORY TREATY ⭐
              </div>

              {/* Stats Box */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginTop: '16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>
                    TIME:
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#00ffcc',
                      background: 'rgba(0, 255, 204, 0.1)',
                      padding: '2px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 255, 204, 0.3)',
                    }}
                  >
                    ⏱️ {victoryTime}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>
                    SCORE:
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffd700',
                      background: 'rgba(255, 215, 0, 0.12)',
                      padding: '2px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 215, 0, 0.35)',
                    }}
                  >
                    ⭐ {finalScore}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="grand-restart-btn clickable"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)',
                    width: '100%',
                    maxWidth: '400px',
                  }}
                  onClick={() => {
                    soundController.playSuccessChime();
                    goToRound(4);
                  }}
                >
                  <span>⚡ PROCEED TO ROUND 4 (VAULT CIPHER) ➔</span>
                </button>

                <a
                  href={victoryFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    maxWidth: '400px',
                    boxSizing: 'border-box',
                    padding: '14px 20px',
                    background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                    color: '#05070a',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    textDecoration: 'none',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 25px rgba(255, 215, 0, 0.65)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                >
                  <span>📜 SUBMIT VICTORY FORM</span>
                  <span style={{ fontSize: '1.2rem' }}>➔</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
