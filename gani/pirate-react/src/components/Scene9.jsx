import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';
import { CODE_SETS } from '../data/codeSets';

export default function Scene9() {
  const { currentScene, resetGame, deductLife, goToRound, activeCodeSet, timeLeft, score } = useGame();
  const isActive = currentScene === 'scene-9';

  const currentCodeSet = activeCodeSet || CODE_SETS[0];
  const VALID_ORDER_MAIN_FIRST = currentCodeSet.validOrderMainFirst;
  const VALID_ORDER_METHOD_FIRST = currentCodeSet.validOrderMethodFirst;
  const ORIGINAL_JAVA_LINES = VALID_ORDER_MAIN_FIRST;

  // Sub-stages: 'puzzle' (default, immediate code challenge) | 'intro' | 'victory'
  const [stage, setStage] = useState('puzzle');

  // Typewriter text
  const [displayedText, setDisplayedText] = useState(currentCodeSet.introText);
  const [isTyping, setIsTyping] = useState(false);
  const [introDone, setIntroDone] = useState(true);

  // Helper to build shuffled lines
  const buildShuffled = (lines) => {
    const items = lines.map((text, idx) => ({
      id: `line-${idx}-${text.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`,
      text,
      origIdx: idx,
    }));
    let shuffled = [...items];
    let isSame = true;
    while (isSame && items.length > 1) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const matchesMain = shuffled.every((item, i) => item.text === VALID_ORDER_MAIN_FIRST[i]);
      const matchesMethod = shuffled.every((item, i) => item.text === VALID_ORDER_METHOD_FIRST[i]);
      isSame = matchesMain || matchesMethod;
    }
    return shuffled;
  };

  // Puzzle state: Guaranteed shuffled
  const [codeLines, setCodeLines] = useState(() => buildShuffled(ORIGINAL_JAVA_LINES));
  const [holdingSlot, setHoldingSlot] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [draggedFromHolding, setDraggedFromHolding] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [correctIndices, setCorrectIndices] = useState(new Set());
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // Sync state whenever activeCodeSet changes
  useEffect(() => {
    setCodeLines(buildShuffled(currentCodeSet.validOrderMainFirst));
    setHoldingSlot(null);
    setSelectedIdx(null);
    setCorrectIndices(new Set());
    setFeedback({ text: '', type: '' });
    setPuzzleSolved(false);
    setDisplayedText(currentCodeSet.introText);
  }, [currentCodeSet.id]);

  useEffect(() => {
    if (!isActive || stage !== 'intro') return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < currentCodeSet.introText.length) {
        setDisplayedText(currentCodeSet.introText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setIntroDone(true);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [isActive, stage, currentCodeSet.introText]);

  const handleStartPuzzle = () => {
    soundController.playSuccessChime();
    setStage('puzzle');
  };

  const handleSkipOrStart = () => {
    setDisplayedText(currentCodeSet.introText);
    setIntroDone(true);
    setIsTyping(false);
  };

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    setDraggedFromHolding(false);
    e.dataTransfer.setData('text/plain', idx.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStartHolding = (e) => {
    setDraggedFromHolding(true);
    setDraggedIdx(-1);
    e.dataTransfer.setData('text/plain', 'holding');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnLine = (e, targetIdx) => {
    e.preventDefault();
    soundController.playKeypadClick();

    if (draggedFromHolding && holdingSlot) {
      setCodeLines(prev => {
        const next = [...prev];
        next.splice(targetIdx, 0, holdingSlot);
        return next;
      });
      setHoldingSlot(null);
      setDraggedFromHolding(false);
      return;
    }

    if (draggedIdx === null || draggedIdx === targetIdx) return;

    setCodeLines(prev => {
      const next = [...prev];
      const [draggedItem] = next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, draggedItem);
      return next;
    });

    setDraggedIdx(null);
  };

  const handleDropOnHolding = (e) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx < 0) return;
    soundController.playKeypadClick();

    if (holdingSlot) {
      const itemToHold = codeLines[draggedIdx];
      setCodeLines(prev => {
        const next = [...prev];
        next[draggedIdx] = holdingSlot;
        return next;
      });
      setHoldingSlot(itemToHold);
    } else {
      const itemToHold = codeLines[draggedIdx];
      setCodeLines(prev => prev.filter((_, i) => i !== draggedIdx));
      setHoldingSlot(itemToHold);
    }

    setDraggedIdx(null);
  };

  const handleLineClick = (idx) => {
    if (puzzleSolved) return;
    soundController.playHoverChime(420);

    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      soundController.playKeypadClick();
      setCodeLines(prev => {
        const next = [...prev];
        [next[selectedIdx], next[idx]] = [next[idx], next[selectedIdx]];
        return next;
      });
      setSelectedIdx(null);
    }
  };

  const handleMoveUp = (e, idx) => {
    e.stopPropagation();
    if (idx === 0) return;
    soundController.playKeypadClick();
    setCodeLines(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setSelectedIdx(null);
  };

  const handleMoveDown = (e, idx) => {
    e.stopPropagation();
    if (idx >= codeLines.length - 1) return;
    soundController.playKeypadClick();
    setCodeLines(prev => {
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
    setSelectedIdx(null);
  };

  const handleSendToHolding = (e, idx) => {
    e.stopPropagation();
    if (holdingSlot) {
      const current = codeLines[idx];
      setCodeLines(prev => {
        const next = [...prev];
        next[idx] = holdingSlot;
        return next;
      });
      setHoldingSlot(current);
    } else {
      const current = codeLines[idx];
      setCodeLines(prev => prev.filter((_, i) => i !== idx));
      setHoldingSlot(current);
    }
    setSelectedIdx(null);
  };

  const handleReleaseFromHolding = () => {
    if (!holdingSlot) return;
    soundController.playKeypadClick();
    setCodeLines(prev => [...prev, holdingSlot]);
    setHoldingSlot(null);
  };

  const handleCheckCode = () => {
    if (holdingSlot) {
      soundController.playErrorSound();
      setFeedback({
        text: `Holding area is not empty! Place all ${ORIGINAL_JAVA_LINES.length} lines back into the program.`,
        type: 'warning',
      });
      return;
    }

    if (codeLines.length !== ORIGINAL_JAVA_LINES.length) {
      soundController.playErrorSound();
      setFeedback({
        text: `Line count mismatch (${codeLines.length}/${ORIGINAL_JAVA_LINES.length} lines). Reassemble all lines.`,
        type: 'warning',
      });
      return;
    }

    const matchingMainFirst = new Set();
    const matchingMethodFirst = new Set();

    for (let i = 0; i < codeLines.length; i++) {
      if (codeLines[i]?.text === VALID_ORDER_MAIN_FIRST[i]) {
        matchingMainFirst.add(i);
      }
      if (codeLines[i]?.text === VALID_ORDER_METHOD_FIRST[i]) {
        matchingMethodFirst.add(i);
      }
    }

    const matching = matchingMainFirst.size >= matchingMethodFirst.size
      ? matchingMainFirst
      : matchingMethodFirst;

    setCorrectIndices(matching);

    const isCorrect = matching.size === ORIGINAL_JAVA_LINES.length;

    if (isCorrect) {
      soundController.playSuccessChime();
      setPuzzleSolved(true);
      setFeedback({
        text: 'PERFECT ALIGNMENT! The Aztec Cipher resolves cleanly! The ancient Java algorithm executes flawlessly!',
        type: 'success',
      });
      setTimeout(() => {
        setStage('victory');
      }, 1500);
    } else {
      soundController.playErrorSound();
      deductLife();
      setFeedback({
        text: `Cursed logic detected! ${matching.size}/${ORIGINAL_JAVA_LINES.length} lines are currently in correct position. Check the highlighted red lines!`,
        type: 'error',
      });
    }
  };

  const handleResetPuzzle = () => {
    soundController.playHoverChime(350);
    setCodeLines(buildShuffled(ORIGINAL_JAVA_LINES));
    setHoldingSlot(null);
    setSelectedIdx(null);
    setCorrectIndices(new Set());
    setFeedback({ text: '', type: '' });
  };

  const renderCodeLine = (line, idx) => {
    const isSelected = selectedIdx === idx;
    const isCorrect = correctIndices.has(idx);
    const hasChecked = correctIndices.size > 0;
    const isWrong = hasChecked && !isCorrect;

    return (
      <div
        key={line.id}
        draggable={!puzzleSolved}
        onDragStart={(e) => handleDragStart(e, idx)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnLine(e, idx)}
        onClick={() => handleLineClick(idx)}
        className={`code-draggable-line ${isSelected ? 'selected' : ''} ${
          isCorrect ? 'correct-pos' : isWrong ? 'wrong-pos' : ''
        }`}
      >
        <span className="line-number-label">{idx + 1}</span>
        <div className="line-drag-handle" title="Drag to reorder">
          ⋮⋮
        </div>
        <code className="line-code-snippet">{line.text}</code>

        <div className="line-action-controls">
          <button
            type="button"
            className="mini-btn"
            title="Move line up"
            disabled={idx === 0 || puzzleSolved}
            onClick={(e) => handleMoveUp(e, idx)}
          >
            ▲
          </button>
          <button
            type="button"
            className="mini-btn"
            title="Move line down"
            disabled={idx === codeLines.length - 1 || puzzleSolved}
            onClick={(e) => handleMoveDown(e, idx)}
          >
            ▼
          </button>
          <button
            type="button"
            className="mini-btn"
            title="Send or swap with holding area"
            disabled={puzzleSolved}
            onClick={(e) => handleSendToHolding(e, idx)}
          >
            📥
          </button>
        </div>
      </div>
    );
  };

  const midPoint = Math.ceil(codeLines.length / 2);
  const part1Lines = codeLines.slice(0, midPoint);
  const part2Lines = codeLines.slice(midPoint);

  return (
    <section
      id="scene-9"
      className={`scene ${isActive ? 'active' : ''}`}
      style={isActive ? { opacity: 1, visibility: 'visible', zIndex: 25, display: 'flex' } : {}}
    >
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Level 3 Background"
        className="chamber-bg"
      />

      {/* STAGE 1: INTRO TYPEWRITER (ACCESSIBLE VIA STORY BUTTON) */}
      {stage === 'intro' && (
        <div className="level3-intro-screen-wrapper" style={{ position: 'relative', zIndex: 15 }}>
          <header className="level3-intro-header">
            <h1 className="level3-intro-title">ROUND 4: {currentCodeSet.name.toUpperCase()}</h1>
            <p className="level3-intro-meta">CIPHER DIFFICULTY: MASTER • RUNTIME: O(N)</p>
          </header>

          <div className="typewriter-box-container">
            <p id="level3-typewriter-text" className="typewriter-text">
              {displayedText}
              {isTyping && <span className="typewriter-cursor"></span>}
            </p>
          </div>

          <div className="level3-intro-btn-row">
            <button
              id="level3-intro-next-btn"
              className="next-btn clickable active"
              onClick={handleStartPuzzle}
              onMouseEnter={() => soundController.playHoverChime(580)}
              aria-label="Begin Round 4 Challenge"
            >
              <span>RETURN TO CODE CHAMBER ➔</span>
            </button>
            {!introDone && (
              <button
                type="button"
                className="skip-intro-btn clickable"
                onClick={handleSkipOrStart}
                title="Skip typewriter animation"
              >
                SKIP INTRO ⏩
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: JUMBLED JAVA CODE CHALLENGE (FULL SCREEN SIDE-BY-SIDE) */}
      {stage === 'puzzle' && (
        <div className="level3-puzzle-fullscreen-wrapper" style={{ position: 'relative', zIndex: 15 }}>
          <div id="level3-puzzle-card" className="level3-puzzle-card full-screen-code-layout">
            {/* COMPACT TOP TOOLBAR */}
            <div className="level3-top-toolbar">
              <div className="toolbar-left-group">
                <span className="level3-compact-title">⚡ ROUND 4: {currentCodeSet.name.toUpperCase()}</span>
                <span className="toolbar-hint-badge">
                  📜 SET {currentCodeSet.setIndex} — {currentCodeSet.subtitle} ({ORIGINAL_JAVA_LINES.length} lines)
                </span>
              </div>

              {/* HOLDING SLOT */}
              <div
                id="holding-slot-box"
                className={`holding-slot-box ${holdingSlot ? 'has-held' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDropOnHolding}
                onClick={handleReleaseFromHolding}
                title={holdingSlot ? 'Click to return held line to list' : 'Drop line here or click 📥 on any line'}
              >
                <span className="holding-icon">📥</span>
                {!holdingSlot ? (
                  <span className="holding-placeholder">Temporary Swap Slot (Empty)</span>
                ) : (
                  <div
                    className="holding-filled-item"
                    draggable
                    onDragStart={handleDragStartHolding}
                  >
                    <code>{holdingSlot.text}</code>
                    <span className="holding-click-hint">Click to place at bottom</span>
                  </div>
                )}
              </div>

              {/* TOP ACTION BUTTONS */}
              <div className="toolbar-action-buttons">
                <button
                  type="button"
                  className="tb-btn view-story-btn clickable"
                  onClick={() => setStage('intro')}
                  title="View algorithm cipher lore"
                >
                  📖 LORE
                </button>
                <button
                  id="level3-reset-btn"
                  className="tb-btn reset-btn clickable"
                  onClick={handleResetPuzzle}
                  title="Shuffle code lines"
                >
                  🔀 SHUFFLE
                </button>
                <button
                  id="level3-verify-btn"
                  className="tb-btn verify-btn clickable"
                  onClick={handleCheckCode}
                  title="Test Java line sequence"
                >
                  ⚡ EXECUTE CODE
                </button>
              </div>
            </div>

            {/* FEEDBACK BANNER */}
            {feedback.text && (
              <div
                id="level3-feedback-box"
                className={`level3-compact-feedback ${feedback.type}`}
                role="status"
              >
                {feedback.text}
              </div>
            )}

            {/* SPLIT 2-COLUMN VIEW FOR ALL LINES */}
            <div className="code-split-columns-container">
              {/* Column 1 */}
              <div className="code-column-half">
                <div className="column-header-tag">PART 1 (LINES 1 – {midPoint})</div>
                <div className="code-lines-vertical-list">
                  {part1Lines.map((line, idx) => renderCodeLine(line, idx))}
                </div>
              </div>

              {/* Column 2 */}
              <div className="code-column-half">
                <div className="column-header-tag">PART 2 (LINES {midPoint + 1} – {codeLines.length})</div>
                <div className="code-lines-vertical-list">
                  {part2Lines.map((line, idx) => renderCodeLine(line, midPoint + idx))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: GRAND FINAL VICTORY MODAL */}
      {stage === 'victory' && (() => {
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
                🏆💎🏴‍☠️👑⭐
              </div>
              <h1 className="grand-victory-title">VAULT CIPHER CRACKED! PIRATE LEGEND ACHIEVED!</h1>
              <p className="grand-victory-text">
                "By conquering all four trials—the 3 Chamber Puzzles, the Mayan Sudoku, the 34-Territory Great Archipelago, and the Aztec Java Cipher—you have unlocked the greatest hoard in the Seven Seas!"
              </p>
              <div className="grand-badge-box">
                ⭐ MASTER OF THE PIRATE REALM ⭐
              </div>

              {/* Victory Stats Box */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  marginTop: '18px',
                  marginBottom: '18px',
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

              {/* Action Button to Open Prefilled Victory Google Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
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
                    maxWidth: '420px',
                    boxSizing: 'border-box',
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
                    color: '#05070a',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    letterSpacing: '1.5px',
                    textDecoration: 'none',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 35px rgba(255, 215, 0, 0.75), inset 0 0 15px rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0 45px rgba(255, 215, 0, 0.95)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 215, 0, 0.75)';
                  }}
                >
                  <span>📜 SUBMIT VICTORY FORM</span>
                  <span style={{ fontSize: '1.25rem' }}>➔</span>
                </a>

                <div style={{ fontSize: '0.8rem', color: '#e8d8b8', opacity: 0.85 }}>
                  Your Time (<strong>{victoryTime}</strong>) and Score (<strong>{finalScore}</strong>) are prefilled automatically in the form.
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
