import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import soundController from '../utils/audio';

const JIGSAW_SOLUTION = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1],
];

const JIGSAW_REGIONS = [
  [1, 1, 1, 2],
  [3, 1, 2, 2],
  [3, 3, 4, 2],
  [3, 4, 4, 4],
];

const JIGSAW_CLUES = [
  [1, 0, 3, 0],
  [0, 0, 0, 2],
  [0, 1, 0, 0],
  [2, 0, 0, 1],
];

const validateJigsawRules = (g) => {
  for (let r = 0; r < 4; r++) {
    const seen = new Set();
    for (let c = 0; c < 4; c++) {
      const v = parseInt(g[r][c], 10);
      if (isNaN(v) || v < 1 || v > 4 || seen.has(v)) return false;
      seen.add(v);
    }
  }
  for (let c = 0; c < 4; c++) {
    const seen = new Set();
    for (let r = 0; r < 4; r++) {
      const v = parseInt(g[r][c], 10);
      if (isNaN(v) || v < 1 || v > 4 || seen.has(v)) return false;
      seen.add(v);
    }
  }
  const regionValues = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = parseInt(g[r][c], 10);
      const reg = JIGSAW_REGIONS[r][c];
      if (isNaN(v) || v < 1 || v > 4 || regionValues[reg].has(v)) return false;
      regionValues[reg].add(v);
    }
  }
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (JIGSAW_CLUES[r][c] !== 0 && parseInt(g[r][c], 10) !== JIGSAW_CLUES[r][c]) {
        return false;
      }
    }
  }
  return true;
};

export default function Scene7() {
  const { currentScene, completeLevel2, deductLife, flashNavigate } = useGame();
  const isActive = currentScene === 'scene-7';

  const [grid, setGrid] = useState(() => {
    return JIGSAW_CLUES.map(row => row.map(val => (val !== 0 ? val.toString() : '')));
  });

  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [isSolved, setIsSolved] = useState(false);
  const proceedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (proceedTimerRef.current) clearTimeout(proceedTimerRef.current);
    };
  }, []);

  const handleCellChange = (r, c, val) => {
    if (JIGSAW_CLUES[r][c] !== 0 || isSolved) return;
    const cleanVal = val.replace(/[^1-4]/g, '').slice(-1);
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
    else if (e.key === 'ArrowDown') tr = Math.min(3, tr + 1);
    else if (e.key === 'ArrowLeft') tc = Math.max(0, tc - 1);
    else if (e.key === 'ArrowRight') tc = Math.min(3, tc + 1);
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
    setGrid(JIGSAW_CLUES.map(row => row.map(val => (val !== 0 ? val.toString() : ''))));
    setFeedback({ text: '', type: '' });
  };

  const handleProceed = () => {
    if (proceedTimerRef.current) clearTimeout(proceedTimerRef.current);
    soundController.playSuccessChime();
    completeLevel2();
    flashNavigate('scene-10');
  };

  const handleSubmit = () => {
    if (isSolved) {
      handleProceed();
      return;
    }

    let allFilled = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c]) {
          allFilled = false;
          break;
        }
      }
      if (!allFilled) break;
    }

    if (!allFilled) {
      soundController.playErrorSound();
      setFeedback({
        text: 'The grid is incomplete! Fill numbers 1–4 in all cells.',
        type: 'warning',
      });
      return;
    }

    let matchesPreset = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (parseInt(grid[r][c], 10) !== JIGSAW_SOLUTION[r][c]) {
          matchesPreset = false;
          break;
        }
      }
      if (!matchesPreset) break;
    }

    const correct = matchesPreset || validateJigsawRules(grid);

    if (correct) {
      soundController.playSuccessChime();
      completeLevel2();
      setIsSolved(true);
      setFeedback({
        text: 'Perfection! Level 2 complete. Unlocking Level 3...',
        type: 'success',
      });
      proceedTimerRef.current = setTimeout(() => {
        handleProceed();
      }, 1600);
    } else {
      soundController.playErrorSound();
      deductLife();
      setFeedback({
        text: 'Incorrect placement! Remember: 1–4 must not repeat in rows, columns, or irregular regions.',
        type: 'error',
      });
    }
  };

  return (
    <section id="scene-7" className={`scene ${isActive ? 'active' : ''}`}>
      <img
        src="/assets/images/cave_level1_bg.jpg"
        alt="Sudoku Chamber Background"
        className="chamber-bg"
      />

      <div className="puzzle-content-wrapper">
        <header className="puzzle-header">
          <h1 className="puzzle-title">4×4 JIGSAW SUDOKU</h1>
          <div className="suguru-rules-box">
            <p className="rules-heading"><strong>JIGSAW SUDOKU RULES:</strong></p>
            <ol className="rules-list">
              <li>Every row must contain numbers 1, 2, 3, and 4 exactly once.</li>
              <li>Every column must contain numbers 1, 2, 3, and 4 exactly once.</li>
              <li>Every irregular jigsaw region must contain numbers 1, 2, 3, and 4 exactly once.</li>
            </ol>
          </div>
        </header>

        <div className="puzzle-grid-card">
          <div id="suguru-grid-container" className="jigsaw-grid-4x4">
            {grid.map((row, r) =>
              row.map((val, c) => {
                const isClue = JIGSAW_CLUES[r][c] !== 0;
                const regionId = JIGSAW_REGIONS[r][c];
                const borderRight = c < 3 && JIGSAW_REGIONS[r][c + 1] !== regionId ? 'jigsaw-border-right' : '';
                const borderBottom = r < 3 && JIGSAW_REGIONS[r + 1][c] !== regionId ? 'jigsaw-border-bottom' : '';
                const borderLeft = c > 0 && JIGSAW_REGIONS[r][c - 1] !== regionId ? 'jigsaw-border-left' : '';
                const borderTop = r > 0 && JIGSAW_REGIONS[r - 1][c] !== regionId ? 'jigsaw-border-top' : '';
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`grid-cell-item jigsaw-region-${regionId} ${borderRight} ${borderBottom} ${borderLeft} ${borderTop} ${isClue ? 'fixed-clue' : ''}`}
                    data-region={regionId}
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
            <div id="suguru-feedback-box" className={`feedback-box ${feedback.type} show`}>
              {feedback.text}
            </div>
          )}

          <div className="puzzle-action-row">
            {!isSolved ? (
              <>
                <button id="suguru-clear-btn" className="back-btn clickable" onClick={handleClear}>
                  RESET GRID
                </button>
                <button id="suguru-submit-btn" className="submit-btn clickable" onClick={handleSubmit}>
                  CHECK PUZZLE
                </button>
              </>
            ) : (
              <button
                id="final-victory-btn"
                className="proceed-btn clickable active"
                style={{ width: '100%', minHeight: '38px', fontSize: '0.9rem' }}
                onClick={handleProceed}
              >
                CLAIM THE MAP 🗺️
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
