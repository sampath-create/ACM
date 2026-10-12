/* ==========================================================================
   LEVEL 2 CONTROLLER: TYPEWRITER, CHALLENGE CARDS, SUDOKU & 4x4 JIGSAW SUDOKU
   ========================================================================== */

class Level2Controller {
  constructor() {
    this.scene5El = document.getElementById('scene-5');
    this.scene6El = document.getElementById('scene-6');
    this.scene7El = document.getElementById('scene-7');

    // Typewriter state
    this.typewriterEl = document.getElementById('level2-typewriter-text');
    this.typewriterSentence = "Beyond this cursed map lie the Bloody Bridge and the Raged River. Only those who conquer the ancient puzzles shall survive the journey.";
    this.typingInterval = null;
    this.isTyping = false;
    this.isTransitioning = false;

    // Sudoku state (9x9)
    this.sudokuContainer = document.getElementById('sudoku-grid-container');
    this.sudokuSolution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    this.sudokuClues = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    // 4x4 Jigsaw Sudoku state
    this.jigsawContainer = document.getElementById('suguru-grid-container');
    this.jigsawSolution = [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [4, 1, 2, 3],
      [2, 3, 4, 1]
    ];
    // 4 Irregular Regions (Region 1, 2, 3, 4 - Non 2x2 boxes):
    // Region 1: (0,0), (0,1), (0,2), (1,1)
    // Region 2: (0,3), (1,2), (1,3), (2,3)
    // Region 3: (1,0), (2,0), (2,1), (3,0)
    // Region 4: (2,2), (3,1), (3,2), (3,3)
    this.jigsawRegions = [
      [1, 1, 1, 2],
      [3, 1, 2, 2],
      [3, 3, 4, 2],
      [3, 4, 4, 4]
    ];
    // Fixed pre-filled clue cells (locked)
    this.jigsawClues = [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [0, 1, 0, 0],
      [2, 0, 0, 1]
    ];

    this.initEvents();
  }

  initLevel2Landing() {
    if (!this.typewriterEl) return;
    this.startTypewriter();
  }

  startTypewriter() {
    this.typewriterEl.innerHTML = '';
    const cardsContainer = document.getElementById('challenge-cards-container');
    const nextContainer = document.getElementById('level2-next-container');

    if (cardsContainer) cardsContainer.classList.remove('revealed');
    if (nextContainer) nextContainer.classList.remove('revealed');

    let index = 0;
    this.isTyping = true;

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';

    if (this.typingInterval) clearInterval(this.typingInterval);

    this.typingInterval = setInterval(() => {
      if (index < this.typewriterSentence.length) {
        const char = this.typewriterSentence.charAt(index);
        if (cursor.parentNode === this.typewriterEl) {
          this.typewriterEl.removeChild(cursor);
        }
        this.typewriterEl.appendChild(document.createTextNode(char));
        this.typewriterEl.appendChild(cursor);

        if (index % 2 === 0 && window.soundController) {
          window.soundController.playTypewriterTick();
        }
        index++;
      } else {
        clearInterval(this.typingInterval);
        this.isTyping = false;

        setTimeout(() => {
          if (cardsContainer) cardsContainer.classList.add('revealed');
          if (nextContainer) nextContainer.classList.add('revealed');
          if (window.soundController) window.soundController.playHoverChime(660);
        }, 500);
      }
    }, 28);
  }

  initEvents() {
    // Level 2 Landing NEXT Button -> Sudoku
    const level2NextBtn = document.getElementById('level2-next-btn');
    if (level2NextBtn) {
      level2NextBtn.addEventListener('mouseenter', () => {
        if (window.soundController) window.soundController.playHoverChime(580);
      });
      level2NextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToScene('scene-6');
      });
    }

    // Sudoku Controls
    const sudokuSubmitBtn = document.getElementById('sudoku-submit-btn');
    const sudokuClearBtn = document.getElementById('sudoku-clear-btn');
    const proceedSuguruBtn = document.getElementById('proceed-suguru-btn');

    if (sudokuSubmitBtn) {
      sudokuSubmitBtn.addEventListener('click', () => this.validateSudoku());
    }
    if (sudokuClearBtn) {
      sudokuClearBtn.addEventListener('click', () => this.clearSudokuUserInputs());
    }
    if (proceedSuguruBtn) {
      proceedSuguruBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playDoorOpenSound();
        this.navigateToScene('scene-7');
      });
    }

    // Jigsaw Sudoku Controls
    const jigsawSubmitBtn = document.getElementById('suguru-submit-btn');
    const jigsawClearBtn = document.getElementById('suguru-clear-btn');
    const finalVictoryBtn = document.getElementById('final-victory-btn');

    if (jigsawSubmitBtn) {
      jigsawSubmitBtn.addEventListener('click', () => this.validateJigsawSudoku());
    }
    if (jigsawClearBtn) {
      jigsawClearBtn.addEventListener('click', () => this.clearJigsawUserInputs());
    }
    if (finalVictoryBtn) {
      finalVictoryBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playSuccessChime();
        if (window.app) window.app.completeLevel2();
        this.navigateToScene('scene-8');
      });
    }

    const level2ContinueBtn = document.getElementById('level2-continue-btn');
    if (level2ContinueBtn) {
      level2ContinueBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('level2-completion-modal');
        if (modal) modal.classList.remove('active');
        this.navigateToScene('scene-8');
      });
    }
  }

  navigateToScene(sceneId) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    if (window.soundController) window.soundController.playDoorOpenSound();

    const flash = document.getElementById('flash-overlay');
    if (flash) {
      flash.classList.add('active');
    }

    setTimeout(() => {
      if (window.app) window.app.navigateTo(sceneId);
      if (sceneId === 'scene-6') {
        this.renderSudokuGrid();
      } else if (sceneId === 'scene-7') {
        this.renderJigsawGrid();
      }
      if (flash) flash.classList.remove('active');
      this.isTransitioning = false;
    }, 800);
  }

  /* ==========================================================================
     SUDOKU 9x9 GRID RENDERING & LOGIC
     ========================================================================== */
  renderSudokuGrid() {
    if (!this.sudokuContainer) return;
    this.sudokuContainer.innerHTML = '';

    const feedbackBox = document.getElementById('sudoku-feedback-box');
    const proceedBtn = document.getElementById('proceed-suguru-btn');
    if (feedbackBox) {
      feedbackBox.textContent = '';
      feedbackBox.className = 'feedback-box';
    }
    if (proceedBtn) proceedBtn.classList.remove('active');

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellVal = this.sudokuClues[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell-item';
        
        if (c % 3 === 2 && c !== 8) cellEl.classList.add('block-border-right');
        if (r % 3 === 2 && r !== 8) cellEl.classList.add('block-border-bottom');

        if (cellVal !== 0) {
          cellEl.classList.add('fixed-clue');
          cellEl.textContent = cellVal;
        } else {
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.className = 'cell-input';
          input.dataset.row = r;
          input.dataset.col = c;

          input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (!/^[1-9]$/.test(val)) {
              e.target.value = '';
            } else if (window.soundController) {
              window.soundController.playKeypadClick();
            }
          });

          input.addEventListener('keydown', (e) => {
            let tr = parseInt(input.dataset.row);
            let tc = parseInt(input.dataset.col);

            if (e.key === 'ArrowUp') tr = Math.max(0, tr - 1);
            else if (e.key === 'ArrowDown') tr = Math.min(8, tr + 1);
            else if (e.key === 'ArrowLeft') tc = Math.max(0, tc - 1);
            else if (e.key === 'ArrowRight') tc = Math.min(8, tc + 1);
            else if (e.key === 'Enter') {
              this.validateSudoku();
              return;
            } else return;

            const nextInput = this.sudokuContainer.querySelector(`input[data-row="${tr}"][data-col="${tc}"]`);
            if (nextInput) nextInput.focus();
          });

          cellEl.appendChild(input);
        }

        this.sudokuContainer.appendChild(cellEl);
      }
    }
  }

  clearSudokuUserInputs() {
    if (!this.sudokuContainer) return;
    const inputs = this.sudokuContainer.querySelectorAll('.cell-input');
    inputs.forEach(input => input.value = '');

    const feedbackBox = document.getElementById('sudoku-feedback-box');
    if (feedbackBox) {
      feedbackBox.textContent = 'Player inputs cleared.';
      feedbackBox.className = 'feedback-box warning show';
      setTimeout(() => feedbackBox.classList.remove('show'), 2000);
    }
    if (window.soundController) window.soundController.playHoverChime(450);
  }

  validateSudoku() {
    const feedbackBox = document.getElementById('sudoku-feedback-box');
    const proceedBtn = document.getElementById('proceed-suguru-btn');
    if (!feedbackBox || !this.sudokuContainer || this.isProcessingSudoku) return;
    if (window.antiCheat && window.antiCheat.state.status !== 'active') return;

    this.isProcessingSudoku = true;
    setTimeout(() => { this.isProcessingSudoku = false; }, 800);

    let isComplete = true;
    let isCorrect = true;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const expected = this.sudokuSolution[r][c];
        const clue = this.sudokuClues[r][c];

        if (clue === 0) {
          const input = this.sudokuContainer.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
          const val = input ? parseInt(input.value, 10) : 0;

          if (isNaN(val) || val === 0) {
            isComplete = false;
          } else if (val !== expected) {
            isCorrect = false;
          }
        }
      }
    }

    if (!isComplete) {
      feedbackBox.textContent = 'Fill all empty Sudoku cells first, pirate!';
      feedbackBox.className = 'feedback-box warning show';
      if (window.soundController) window.soundController.playErrorSound();
      return;
    }

    if (isCorrect) {
      feedbackBox.textContent = 'Puzzle conquered! The path ahead is opening. Click PROCEED TO NEXT QUESTION to continue your journey.';
      feedbackBox.className = 'feedback-box success show';
      if (window.soundController) window.soundController.playSuccessChime();
      if (proceedBtn) proceedBtn.classList.add('active');
    } else {
      feedbackBox.textContent = 'The cursed Sudoku numbers do not align! Check your rows and columns!';
      feedbackBox.className = 'feedback-box error show';
      if (window.soundController) window.soundController.playErrorSound();
      if (window.app) window.app.deductLife();
    }
  }

  /* ==========================================================================
     4x4 JIGSAW SUDOKU GRID RENDERING & LOGIC
     ========================================================================== */
  renderJigsawGrid() {
    if (!this.jigsawContainer) return;
    this.jigsawContainer.innerHTML = '';
    this.jigsawContainer.className = 'jigsaw-grid-4x4';

    const feedbackBox = document.getElementById('suguru-feedback-box');
    const victoryBtn = document.getElementById('final-victory-btn');
    if (feedbackBox) {
      feedbackBox.textContent = '';
      feedbackBox.className = 'feedback-box';
    }
    if (victoryBtn) victoryBtn.classList.remove('active');

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cellVal = this.jigsawClues[r][c];
        const regionId = this.jigsawRegions[r][c];
        const cellEl = document.createElement('div');
        cellEl.className = `grid-cell-item jigsaw-region-${regionId}`;
        cellEl.dataset.region = regionId;

        // Draw thick irregular jigsaw region border boundaries
        if (c < 3 && this.jigsawRegions[r][c+1] !== regionId) cellEl.classList.add('jigsaw-border-right');
        if (r < 3 && this.jigsawRegions[r+1][c] !== regionId) cellEl.classList.add('jigsaw-border-bottom');
        if (c > 0 && this.jigsawRegions[r][c-1] !== regionId) cellEl.classList.add('jigsaw-border-left');
        if (r > 0 && this.jigsawRegions[r-1][c] !== regionId) cellEl.classList.add('jigsaw-border-top');

        if (cellVal !== 0) {
          cellEl.classList.add('fixed-clue');
          cellEl.textContent = cellVal;
        } else {
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.className = 'cell-input';
          input.dataset.row = r;
          input.dataset.col = c;

          input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (!/^[1-4]$/.test(val)) {
              e.target.value = '';
            } else if (window.soundController) {
              window.soundController.playKeypadClick();
            }
          });

          // Keyboard arrow navigation
          input.addEventListener('keydown', (e) => {
            let tr = parseInt(input.dataset.row);
            let tc = parseInt(input.dataset.col);

            if (e.key === 'ArrowUp') tr = Math.max(0, tr - 1);
            else if (e.key === 'ArrowDown') tr = Math.min(3, tr + 1);
            else if (e.key === 'ArrowLeft') tc = Math.max(0, tc - 1);
            else if (e.key === 'ArrowRight') tc = Math.min(3, tc + 1);
            else if (e.key === 'Enter') {
              this.validateJigsawSudoku();
              return;
            } else return;

            const nextInput = this.jigsawContainer.querySelector(`input[data-row="${tr}"][data-col="${tc}"]`);
            if (nextInput) nextInput.focus();
          });

          cellEl.appendChild(input);
        }

        this.jigsawContainer.appendChild(cellEl);
      }
    }
  }

  clearJigsawUserInputs() {
    if (!this.jigsawContainer) return;
    const inputs = this.jigsawContainer.querySelectorAll('.cell-input');
    inputs.forEach(input => input.value = '');

    const feedbackBox = document.getElementById('suguru-feedback-box');
    if (feedbackBox) {
      feedbackBox.textContent = 'Player inputs cleared.';
      feedbackBox.className = 'feedback-box warning show';
      setTimeout(() => feedbackBox.classList.remove('show'), 2000);
    }
    if (window.soundController) window.soundController.playHoverChime(450);
  }

  validateJigsawSudoku() {
    const feedbackBox = document.getElementById('suguru-feedback-box');
    const victoryBtn = document.getElementById('final-victory-btn');
    if (!feedbackBox || !this.jigsawContainer || this.isProcessingJigsaw) return;
    if (window.antiCheat && window.antiCheat.state.status !== 'active') return;

    this.isProcessingJigsaw = true;
    setTimeout(() => { this.isProcessingJigsaw = false; }, 800);

    let grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    let isComplete = true;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const clue = this.jigsawClues[r][c];
        if (clue !== 0) {
          grid[r][c] = clue;
        } else {
          const input = this.jigsawContainer.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
          const val = input ? parseInt(input.value, 10) : 0;
          if (isNaN(val) || val < 1 || val > 4) {
            isComplete = false;
          } else {
            grid[r][c] = val;
          }
        }
      }
    }

    if (!isComplete) {
      feedbackBox.textContent = "THE PUZZLE IS NOT COMPLETE. CHECK THE ROWS, COLUMNS AND REGIONS.";
      feedbackBox.className = 'feedback-box error show';
      if (window.soundController) window.soundController.playErrorSound();
      if (window.app) window.app.deductLife();
      return;
    }

    // Check rows, columns, and irregular jigsaw regions for uniqueness (1..4)
    let isCorrect = true;

    // Check Rows
    for (let r = 0; r < 4; r++) {
      let seen = new Set();
      for (let c = 0; c < 4; c++) {
        seen.add(grid[r][c]);
      }
      if (seen.size !== 4) isCorrect = false;
    }

    // Check Columns
    for (let c = 0; c < 4; c++) {
      let seen = new Set();
      for (let r = 0; r < 4; r++) {
        seen.add(grid[r][c]);
      }
      if (seen.size !== 4) isCorrect = false;
    }

    // Check Irregular Regions
    for (let reg = 1; reg <= 4; reg++) {
      let seen = new Set();
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (this.jigsawRegions[r][c] === reg) {
            seen.add(grid[r][c]);
          }
        }
      }
      if (seen.size !== 4) isCorrect = false;
    }

    if (isCorrect) {
      feedbackBox.textContent = 'CONGRATULATIONS! You solved the 4×4 Jigsaw Sudoku! Click "CLAIM THE MAP" to continue.';
      feedbackBox.className = 'feedback-box success show';
      if (window.soundController) window.soundController.playSuccessChime();
      if (window.app) window.app.completeLevel2();
      if (victoryBtn) {
        victoryBtn.textContent = 'CLAIM THE MAP 🗺️';
        victoryBtn.classList.add('active');
      }
    } else {
      feedbackBox.textContent = "THE PUZZLE IS NOT COMPLETE. CHECK THE ROWS, COLUMNS AND REGIONS.";
      feedbackBox.className = 'feedback-box error show';
      if (window.soundController) window.soundController.playErrorSound();
      if (window.app) window.app.deductLife();
    }
  }
}

window.Level2Controller = Level2Controller;
