import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';
import { SUDOKU_SETS } from '../data/sudokuSets';

const validateSudokuRules = (g, clues) => {
  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Set();
    for (let c = 0; c < 9; c++) {
      const v = parseInt(g[r][c], 10);
      if (isNaN(v) || v < 1 || v > 9 || seen.has(v)) return false;
      seen.add(v);
    }
  }
  // Check cols
  for (let c = 0; c < 9; c++) {
    const seen = new Set();
    for (let r = 0; r < 9; r++) {
      const v = parseInt(g[r][c], 10);
      if (isNaN(v) || v < 1 || v > 9 || seen.has(v)) return false;
      seen.add(v);
    }
  }
  // Check 3x3 blocks
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const seen = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const v = parseInt(g[br + r][bc + c], 10);
          if (isNaN(v) || v < 1 || v > 9 || seen.has(v)) return false;
          seen.add(v);
        }
      }
    }
  }
  // Check that clues were preserved
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (clues[r][c] !== 0 && parseInt(g[r][c], 10) !== clues[r][c]) {
        return false;
      }
    }
  }
  return true;
};

export default function Scene6() {
  const { currentScene, deductLife, flashNavigate, activeSudokuSet } = useGame();
  const isActive = currentScene === 'scene-6';

  const currentSudoku = activeSudokuSet || SUDOKU_SETS[0];
  const SUDOKU_CLUES = currentSudoku.clues;

  const [grid, setGrid] = useState(() => {
    return SUDOKU_CLUES.map(row => row.map(val => (val !== 0 ? val.toString() : '')));
  });

  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [isSolved, setIsSolved] = useState(false);
  const proceedTimerRef = useRef(null);

  // Sync grid when activeSudokuSet changes
  useEffect(() => {
    setGrid(SUDOKU_CLUES.map(row => row.map(val => (val !== 0 ? val.toString() : ''))));
    setIsSolved(false);
    setFeedback({ text: '', type: '' });
  }, [currentSudoku.id]);

  useEffect(() => {
    return () => {
      if (proceedTimerRef.current) clearTimeout(proceedTimerRef.current);
    };
  }, []);

  const handleCellChange = (r, c, val) => {
    if (SUDOKU_CLUES[r][c] !== 0 || isSolved) return;
    const cleanVal = val.replace(/[^1-9]/g, '').slice(-1);
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = cleanVal;
      return next;
    });
    if (cleanVal) soundController.playKeypadClick();
  };

  const handleKeyDown = (r, c, e) => {
    let tr = r;
    let tc = c;
    if (e.key === 'ArrowUp') tr = Math.max(0, tr - 1);
    else if (e.key === 'ArrowDown') tr = Math.min(8, tr + 1);
    else if (e.key === 'ArrowLeft') tc = Math.max(0, tc - 1);
    else if (e.key === 'ArrowRight') tc = Math.min(8, tc + 1);
    else if (e.key === 'Enter') {
      handleSubmit();
      return;
    } else {
      return;
    }

    const nextEl = document.querySelector(`input[data-row="${tr}"][data-col="${tc}"]`);
    if (nextEl) nextEl.focus();
  };

  const handleClear = () => {
    if (isSolved) return;
    soundController.playHoverChime(400);
    setGrid(SUDOKU_CLUES.map(row => row.map(val => (val !== 0 ? val.toString() : ''))));
    setFeedback({ text: '', type: '' });
  };

  const handleProceed = () => {
    if (proceedTimerRef.current) clearTimeout(proceedTimerRef.current);
    soundController.playDoorOpenSound();
    flashNavigate('scene-7');
  };

  const handleSubmit = () => {
    if (isSolved) {
      handleProceed();
      return;
    }

    // Check if fully filled
    let allFilled = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!grid[r][c]) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }

    if (!allFilled) {
      soundController.playErrorSound();
      setFeedback({ text: 'Incomplete grid! Fill all empty cells.', type: 'warning' });
      return;
    }

    // Validate using rules
    if (validateSudokuRules(grid, SUDOKU_CLUES)) {
      soundController.playSuccessChime();
      setFeedback({ text: 'The ancient runes align! The door unseals...', type: 'success' });
      setIsSolved(true);
      proceedTimerRef.current = setTimeout(() => {
        handleProceed();
      }, 1500);
    } else {
      soundController.playErrorSound();
      deductLife();
      setFeedback({ text: 'The runes clash! Check for duplicate numbers.', type: 'error' });
    }
  };

  return (
    <section id="scene-6" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Mayan Chamber"
        className="chamber-bg"
      />

      <div className="puzzle-content-wrapper">
        <header className="puzzle-header">
          {/* Set Badge */}
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
            <span>SET {currentSudoku.setIndex}: {currentSudoku.name}</span>
          </div>
          <h1 className="puzzle-title">ROUND 2: THE CURSED SUDOKU</h1>
          <p className="puzzle-instructions">
            Fill every row, column, and 3×3 subgrid with numbers 1–9 without repeating.
          </p>
        </header>

        <div className="puzzle-grid-card">
          <div id="sudoku-grid-container" className="sudoku-grid-9x9">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isClue = SUDOKU_CLUES[r][c] !== 0;
                const borderRight = c % 3 === 2 && c !== 8 ? 'block-border-right' : '';
                const borderBottom = r % 3 === 2 && r !== 8 ? 'block-border-bottom' : '';
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`grid-cell-item ${borderRight} ${borderBottom} ${isClue ? 'fixed-clue' : ''}`}
                  >
                    {isClue ? (
                      val
                    ) : (
                      <input
                        type="text"
                        maxLength={1}
                        className="cell-input"
                        data-row={r}
                        data-col={c}
                        value={val}
                        disabled={isSolved}
                        onChange={(e) => handleCellChange(r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(r, c, e)}
                        onFocus={() => soundController.playHoverChime(400)}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {feedback.text && (
            <div id="sudoku-feedback-box" className={`feedback-box ${feedback.type} show`}>
              {feedback.text}
            </div>
          )}

          <div className="puzzle-action-row">
            {!isSolved ? (
              <>
                <button id="sudoku-clear-btn" className="back-btn clickable" onClick={handleClear}>
                  RESET GRID
                </button>
                <button id="sudoku-submit-btn" className="submit-btn clickable" onClick={handleSubmit}>
                  SUBMIT
                </button>
              </>
            ) : (
              <button
                id="proceed-suguru-btn"
                className="proceed-btn clickable active"
                style={{ width: '100%', minHeight: '38px', fontSize: '0.9rem' }}
                onClick={handleProceed}
              >
                PROCEED TO NEXT ROUND ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
