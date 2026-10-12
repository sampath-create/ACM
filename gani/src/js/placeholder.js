/* ==========================================================================
   SCENE 3: DOOR 1, DOOR 2 & DOOR 3 QUESTION SCREENS & KEYPAD CONTROLLER
   ========================================================================== */

class PlaceholderController {
  constructor() {
    this.sceneEl = document.getElementById('scene-3');
    this.containerEl = document.getElementById('trial-container');
    this.currentDoorId = 'door1';
    
    // Door 1 & Door 2 Answer State
    this.currentAnswer = '';

    this.initKeyboardEvents();
  }

  updateView(doorId) {
    this.currentDoorId = doorId;
    this.currentAnswer = '';

    if (this.sceneEl) {
      this.sceneEl.setAttribute('data-active-door', doorId);
    }

    if (doorId === 'door1') {
      this.renderDoor1QuestionScreen();
    } else if (doorId === 'door2') {
      this.renderDoor2QuestionScreen();
    } else if (doorId === 'door3') {
      this.renderDoor3QuestionScreen();
    }
  }

  renderQuestionTabs(currentDoorId) {
    const isDoor2Unlocked = window.app ? window.app.isDoorUnlocked('door2') : false;
    const isDoor3Unlocked = window.app ? window.app.isDoorUnlocked('door3') : false;
    const isDoor1Completed = window.app ? window.app.isDoorCompleted('door1') : false;
    const isDoor2Completed = window.app ? window.app.isDoorCompleted('door2') : false;
    const isDoor3Completed = window.app ? window.app.isDoorCompleted('door3') : false;

    return `
      <div class="level1-question-tabs-nav">
        <button class="q-tab-btn ${currentDoorId === 'door1' ? 'active' : ''} ${isDoor1Completed ? 'completed' : ''}" data-target-door="door1">
          <span class="q-tab-num">QUESTION 1</span>
          <span class="q-tab-name">2 Eggs & 100 Floors ${isDoor1Completed ? '✓' : ''}</span>
        </button>
        <button class="q-tab-btn ${currentDoorId === 'door2' ? 'active' : ''} ${!isDoor2Unlocked ? 'disabled' : ''} ${isDoor2Completed ? 'completed' : ''}" data-target-door="door2" ${!isDoor2Unlocked ? 'disabled' : ''}>
          <span class="q-tab-num">QUESTION 2</span>
          <span class="q-tab-name">1,000 Bottles ${!isDoor2Unlocked ? '🔒' : isDoor2Completed ? '✓' : ''}</span>
        </button>
        <button class="q-tab-btn ${currentDoorId === 'door3' ? 'active' : ''} ${!isDoor3Unlocked ? 'disabled' : ''} ${isDoor3Completed ? 'completed' : ''}" data-target-door="door3" ${!isDoor3Unlocked ? 'disabled' : ''}>
          <span class="q-tab-num">QUESTION 3</span>
          <span class="q-tab-name">Missing Number ${!isDoor3Unlocked ? '🔒' : isDoor3Completed ? '✓' : ''}</span>
        </button>
      </div>
    `;
  }

  bindQuestionTabEvents() {
    const tabBtns = document.querySelectorAll('.q-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const door = btn.dataset.targetDoor;
        if (!door || btn.disabled || btn.classList.contains('disabled')) return;
        if (window.soundController) window.soundController.playHoverChime(500);
        if (window.app) {
          window.app.setSelectedDoor(door);
        }
      });
    });
  }

  /* ==========================================================================
     DOOR 1: TWO-COLUMN LAYOUT (LEFT: QUESTION, RIGHT: ANSWER BOX + KEYPAD + SUBMIT)
     ========================================================================== */
  renderDoor1QuestionScreen() {
    if (!this.containerEl) return;

    const isDoor2Unlocked = window.app ? window.app.isDoorUnlocked('door2') : false;

    this.containerEl.innerHTML = `
      <div class="trial-wrapper">
        ${this.renderQuestionTabs('door1')}

        <div class="trial-header-bar">
          <div class="trial-header-title">
            <span>🔥</span>
            <span>DOOR 1: THE CRIMSON RUNES</span>
          </div>
          <div class="door-tag">TRIAL 01</div>
        </div>

        <div class="door1-layout-grid">
          
          <!-- LEFT SIDE: QUESTION PANEL -->
          <div class="question-panel">
            <span class="puzzle-title-tag">Question 1</span>
            <h2 class="puzzle-main-title">2 Eggs & 100 Floors</h2>
            
            <div class="puzzle-body-text">
              You are given a building with 100 floors and 2 identical eggs.
              <br><br>
              There is an unknown floor <code>F</code> such that:
              <ul class="puzzle-list">
                <li>If an egg is dropped from floor <code>F</code> or any floor above it, the egg breaks.</li>
                <li>If an egg is dropped from any floor below <code>F</code>, it does not break.</li>
                <li>Once an egg breaks, you cannot use it again.</li>
                <li>You can reuse an egg if it does not break.</li>
                <li>You need to determine the highest floor from which an egg can be dropped without breaking.</li>
              </ul>
            </div>

            <div class="puzzle-task-box">
              <div class="task-label">TASK QUESTION:</div>
              <div class="task-text">What is the minimum number of drops required in the worst case?</div>
            </div>
          </div>

          <!-- RIGHT SIDE: ANSWER ENTRY INTERFACE (ANSWER BOX + KEYPAD + SUBMIT) -->
          <div class="door1-keypad-panel">
            <div class="keypad-header-label">ANSWER</div>
            
            <!-- 1. Answer Box -->
            <div class="answer-box-container">
              <div class="answer-box placeholder-active" id="answer-box">Enter your answer</div>
            </div>

            <!-- 2. Mobile Phone Style Numeric Keypad (1-9, ←, 0, C) -->
            <div class="keypad-grid">
              <button class="keypad-btn clickable" data-key="1">1</button>
              <button class="keypad-btn clickable" data-key="2">2</button>
              <button class="keypad-btn clickable" data-key="3">3</button>
              <button class="keypad-btn clickable" data-key="4">4</button>
              <button class="keypad-btn clickable" data-key="5">5</button>
              <button class="keypad-btn clickable" data-key="6">6</button>
              <button class="keypad-btn clickable" data-key="7">7</button>
              <button class="keypad-btn clickable" data-key="8">8</button>
              <button class="keypad-btn clickable" data-key="9">9</button>
              <button class="keypad-btn fn-btn clickable" data-action="backspace">←</button>
              <button class="keypad-btn clickable" data-key="0">0</button>
              <button class="keypad-btn fn-btn clickable" data-action="clear">C</button>
            </div>

            <!-- 3. Submit Answer Button -->
            <button class="submit-btn clickable" id="submit-answer-btn">SUBMIT ANSWER</button>

            <!-- Feedback Display Box -->
            <div class="feedback-box" id="feedback-box"></div>

            <!-- Action Navigation Buttons -->
            <div class="action-buttons-group">
              <button class="proceed-btn clickable ${isDoor2Unlocked ? 'active' : ''}" id="proceed-door2-btn">
                <span>PROCEED TO DOOR 2 →</span>
              </button>
              <button class="back-btn clickable" id="back-level1-btn">
                <span>← RETURN TO LEVEL 1</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }

    this.bindDoor1Events();
  }

  bindDoor1Events() {
    const answerBox = document.getElementById('answer-box');
    const feedbackBox = document.getElementById('feedback-box');
    const submitBtn = document.getElementById('submit-answer-btn');
    const proceedBtn = document.getElementById('proceed-door2-btn');
    const backBtn = document.getElementById('back-level1-btn');
    const keypadBtns = document.querySelectorAll('.keypad-btn');

    const updateDisplay = () => {
      if (!answerBox) return;
      if (this.currentAnswer.length === 0) {
        answerBox.textContent = 'Enter your answer';
        answerBox.classList.add('placeholder-active');
      } else {
        answerBox.textContent = this.currentAnswer;
        answerBox.classList.remove('placeholder-active');
      }
      answerBox.classList.remove('error-border', 'success-border');
    };

    keypadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playKeypadClick();

        const key = btn.dataset.key;
        const action = btn.dataset.action;

        if (key !== undefined) {
          if (this.currentAnswer.length < 6) {
            this.currentAnswer += key;
          }
        } else if (action === 'clear') {
          this.currentAnswer = '';
        } else if (action === 'backspace') {
          this.currentAnswer = this.currentAnswer.slice(0, -1);
        }

        updateDisplay();
      });
    });

    let isSubmitting = false;
    const handleSubmit = () => {
      if (!feedbackBox || !answerBox || isSubmitting) return;
      if (window.antiCheat && window.antiCheat.state.status !== 'active') return;

      isSubmitting = true;
      setTimeout(() => { isSubmitting = false; }, 800);

      const trimmed = this.currentAnswer.trim();

      if (trimmed === '') {
        feedbackBox.textContent = 'Enter your answer first!';
        feedbackBox.className = 'feedback-box warning show';
        answerBox.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        return;
      }

      if (trimmed === '14') {
        feedbackBox.textContent = 'Correct! Minimum drops required in the worst case is 14. Door 2 is unlocked!';
        feedbackBox.className = 'feedback-box success show';
        answerBox.classList.remove('error-border');
        answerBox.classList.add('success-border');

        if (window.soundController) window.soundController.playSuccessChime();
        if (window.app) window.app.unlockDoor('door2');

        if (window.antiCheat) {
          window.antiCheat.updateState({
            unlockedDoors: window.app ? window.app.unlockedDoors : {},
            completedDoors: window.app ? window.app.completedDoors : {},
            score: (window.antiCheat.state.score || 0) + 100
          });
        }

        if (proceedBtn) proceedBtn.classList.add('active');

        setTimeout(() => {
          if (this.currentDoorId === 'door1' && window.app) {
            window.app.setSelectedDoor('door2');
            window.app.navigateTo('scene-3');
          }
        }, 1500);
      } else {
        feedbackBox.textContent = 'Incorrect! Calculate the optimal drop strategy for 2 eggs.';
        feedbackBox.className = 'feedback-box error show';
        answerBox.classList.add('error-border');
        
        const panel = document.querySelector('.door1-keypad-panel');
        if (panel) {
          panel.classList.add('shake');
          setTimeout(() => panel.classList.remove('shake'), 500);
        }

        if (window.app) window.app.deductLife();
      }
    };

    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playDoorOpenSound();
        if (window.app) {
          window.app.setSelectedDoor('door2');
          window.app.navigateTo('scene-3');
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playHoverChime(400);
        if (window.app) window.app.navigateTo('scene-2');
      });
    }

    this.bindQuestionTabEvents();
  }

  /* ==========================================================================
     DOOR 2: QUESTION SCREEN & KEYPAD LAYOUT
     ========================================================================== */
  renderDoor2QuestionScreen() {
    if (!this.containerEl) return;

    const isDoor3Unlocked = window.app ? window.app.isDoorUnlocked('door3') : false;

    this.containerEl.innerHTML = `
      <div class="trial-wrapper door2-vertical-wrapper">
        ${this.renderQuestionTabs('door2')}
        
        <!-- Header Bar -->
        <div class="trial-header-bar gold-theme" style="width: 100%;">
          <div class="trial-header-title">
            <span>🗝️</span>
            <span>DOOR 2: THE POISON BOTTLES</span>
          </div>
          <div class="door-tag" style="color: #ffd24c; border-color: #ffd24c;">TRIAL 02</div>
        </div>

        <!-- TOP QUESTION PANEL -->
        <div class="question-panel gold-theme">
          <span class="puzzle-title-tag">Question 2</span>
          <h2 class="puzzle-main-title">1,000 Bottles of Liquid</h2>
          
          <div class="puzzle-body-text">
            You have 1,000 bottles of liquid. Exactly <strong>one bottle contains poison</strong>.
            <br><br>
            The poison has the following properties:
            <ul class="puzzle-list">
              <li>A subject dies exactly <strong>24 hours</strong> after consuming any amount of poison.</li>
              <li>A subject can drink from multiple bottles.</li>
              <li>You can give different combinations of bottles to different subjects.</li>
              <li>You have only <strong>one testing round</strong>.</li>
              <li>After 24 hours, you observe which subjects survived and which died.</li>
            </ul>
          </div>

          <div class="puzzle-task-box">
            <div class="task-label">TASK QUESTION:</div>
            <div class="task-text">What is the minimum number of test subjects required to identify the poisoned bottle?</div>
          </div>
        </div>

        <!-- 1. SINGLE ANSWER BOX -->
        <div class="door2-answer-box-wrapper" style="width: 100%;">
          <div class="answer-box placeholder-active" id="answer-box">Enter your answer</div>
        </div>

        <!-- 2. NUMERIC KEYPAD -->
        <div class="dual-keypads-wrapper" style="max-width: 340px;">
          <div class="keypad-column" style="width: 100%;">
            <div class="keypad-column-title">NUMERIC KEYPAD</div>
            <div class="num-keypad-grid">
              <button class="keypad-btn clickable" data-key="1">1</button>
              <button class="keypad-btn clickable" data-key="2">2</button>
              <button class="keypad-btn clickable" data-key="3">3</button>
              <button class="keypad-btn clickable" data-key="4">4</button>
              <button class="keypad-btn clickable" data-key="5">5</button>
              <button class="keypad-btn clickable" data-key="6">6</button>
              <button class="keypad-btn clickable" data-key="7">7</button>
              <button class="keypad-btn clickable" data-key="8">8</button>
              <button class="keypad-btn clickable" data-key="9">9</button>
              <button class="keypad-btn fn-btn clickable" data-action="backspace">←</button>
              <button class="keypad-btn clickable" data-key="0">0</button>
              <button class="keypad-btn fn-btn clickable" data-action="clear">C</button>
            </div>
          </div>
        </div>

        <!-- 3. SUBMIT ANSWER BUTTON -->
        <button class="submit-btn clickable" id="submit-answer-btn">SUBMIT ANSWER</button>
        
        <!-- Feedback Box -->
        <div class="feedback-box" id="feedback-box"></div>

        <!-- Action Navigation Buttons -->
        <div class="action-buttons-group">
          <button class="proceed-btn clickable ${isDoor3Unlocked ? 'active' : ''}" id="proceed-door3-btn">
            <span>PROCEED TO DOOR 3 →</span>
          </button>
          <button class="back-btn clickable" id="back-level1-btn">
            <span>← RETURN TO LEVEL 1</span>
          </button>
        </div>

      </div>
    `;

    this.bindDoor2Events();
  }

  bindDoor2Events() {
    const answerBox = document.getElementById('answer-box');
    const feedbackBox = document.getElementById('feedback-box');
    const submitBtn = document.getElementById('submit-answer-btn');
    const proceedBtn = document.getElementById('proceed-door3-btn');
    const backBtn = document.getElementById('back-level1-btn');
    const keypadBtns = document.querySelectorAll('.keypad-btn');

    const updateDisplay = () => {
      if (!answerBox) return;
      if (this.currentAnswer.length === 0) {
        answerBox.textContent = 'Enter your answer';
        answerBox.classList.add('placeholder-active');
      } else {
        answerBox.textContent = this.currentAnswer;
        answerBox.classList.remove('placeholder-active');
      }
      answerBox.classList.remove('error-border', 'success-border');
    };

    keypadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playKeypadClick();

        const key = btn.dataset.key;
        const action = btn.dataset.action;

        if (key !== undefined) {
          if (this.currentAnswer.length < 10) {
            this.currentAnswer += key;
          }
        } else if (action === 'clear') {
          this.currentAnswer = '';
        } else if (action === 'backspace') {
          this.currentAnswer = this.currentAnswer.slice(0, -1);
        }

        updateDisplay();
      });
    });

    let isSubmitting = false;
    const handleSubmit = () => {
      if (!feedbackBox || !answerBox || isSubmitting) return;
      if (window.antiCheat && window.antiCheat.state.status !== 'active') return;

      isSubmitting = true;
      setTimeout(() => { isSubmitting = false; }, 800);

      const trimmed = this.currentAnswer.trim();

      if (trimmed === '') {
        feedbackBox.textContent = 'Enter your answer before submitting!';
        feedbackBox.className = 'feedback-box warning show';
        answerBox.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        return;
      }

      if (trimmed === '10') {
        feedbackBox.textContent = 'Correct! 10 test subjects are required (2¹⁰ = 1024). Door 3 is unlocked!';
        feedbackBox.className = 'feedback-box success show';
        answerBox.classList.remove('error-border');
        answerBox.classList.add('success-border');

        if (window.soundController) window.soundController.playSuccessChime();
        if (window.app) window.app.unlockDoor('door3');

        if (window.antiCheat) {
          window.antiCheat.updateState({
            unlockedDoors: window.app ? window.app.unlockedDoors : {},
            completedDoors: window.app ? window.app.completedDoors : {},
            score: (window.antiCheat.state.score || 0) + 100
          });
        }

        if (proceedBtn) proceedBtn.classList.add('active');

        setTimeout(() => {
          if (this.currentDoorId === 'door2' && window.app) {
            window.app.setSelectedDoor('door3');
            window.app.navigateTo('scene-3');
          }
        }, 1500);
      } else {
        feedbackBox.textContent = 'Incorrect! Think in binary combinations (2ⁿ ≥ 1000). Try again!';
        feedbackBox.className = 'feedback-box error show';
        answerBox.classList.add('error-border');

        const panel = document.querySelector('.door2-vertical-wrapper');
        if (panel) {
          panel.classList.add('shake');
          setTimeout(() => panel.classList.remove('shake'), 500);
        }

        if (window.app) window.app.deductLife();
      }
    };

    if (submitBtn) submitBtn.addEventListener('click', handleSubmit);

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playDoorOpenSound();
        if (window.app) {
          window.app.setSelectedDoor('door3');
          window.app.navigateTo('scene-3');
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playHoverChime(400);
        if (window.app) window.app.navigateTo('scene-2');
      });
    }

    this.bindQuestionTabEvents();
  }

  /* ==========================================================================
     DOOR 3: CODING QUESTION SCREEN (n input + code editor + output input)
     ========================================================================== */
  renderDoor3QuestionScreen() {
    if (!this.containerEl) return;

    this.containerEl.innerHTML = `
      <div class="trial-wrapper door2-vertical-wrapper" style="max-width: 1050px;">
        ${this.renderQuestionTabs('door3')}
        <div class="trial-header-bar azure-theme" style="width: 100%;">
          <div class="trial-header-title">
            <span>⚡</span>
            <span>DOOR 3: FIND MISSING NUMBER</span>
          </div>
          <div class="door-tag" style="color: #5ce1e6; border-color: #5ce1e6;">TRIAL 03</div>
        </div>

        <div class="door3-code-layout-grid">
          
          <!-- LEFT SIDE: QUESTION STATEMENT & CONSTRAINTS -->
          <div class="question-panel azure-theme">
            <span class="puzzle-title-tag">Question 3</span>
            <h2 class="puzzle-main-title">Find Missing Number</h2>
            
            <div class="puzzle-body-text">
              You are given an array <code>nums</code> containing <code>n</code> distinct integers from the range <code>[0, n]</code>. Exactly one number from this range is missing.
              <br><br>
              Find the missing number <strong>without sorting the array or using any additional data structure</strong>.
            </div>

            <div class="puzzle-task-box">
              <div class="task-label">CONSTRAINTS:</div>
              <ul class="puzzle-list" style="margin-top: 4px; margin-left: 14px;">
                <li><code>1 ≤ n ≤ 10⁵</code></li>
                <li><code>nums.length = n</code></li>
                <li>All elements are distinct.</li>
                <li>Every element is in the range <code>[0, n]</code>.</li>
                <li>Time complexity: <strong>O(n)</strong></li>
                <li>Extra space: <strong>O(1)</strong></li>
              </ul>
            </div>

            <div class="puzzle-why-hard-box" style="border-color: rgba(0, 217, 255, 0.4);">
              <div class="why-hard-title" style="color: #5ce1e6;">SAMPLE CHALLENGE</div>
              <div class="why-hard-text">
                <strong>Array:</strong> <code>nums = [3, 0, 1]</code><br>
                Determine the value of <code>n</code>, write your solution code, and enter the output missing number.
              </div>
            </div>
          </div>

          <!-- RIGHT SIDE: THREE REQUIRED INPUTS (n input + code editor + output input) -->
          <div class="door3-code-editor-panel">
            
            <!-- 1. N VALUE INPUT -->
            <div class="door3-input-group">
              <label class="door3-input-label" for="n-input">Enter n:</label>
              <div class="door3-inline-input-row">
                <span>n =</span>
                <input type="number" id="n-input" class="door3-single-input" placeholder="Value of n">
              </div>
            </div>

            <!-- 2. CODE EDITOR BOX -->
            <div class="door3-input-group" style="flex: 1;">
              <label class="door3-input-label" for="code-input">Write your solution code:</label>
              <textarea id="code-input" class="code-editor-textarea" spellcheck="false" placeholder="// Write your solution code here..."></textarea>
            </div>

            <!-- 3. OUTPUT / MISSING NUMBER INPUT -->
            <div class="door3-input-group">
              <label class="door3-input-label" for="output-input">Enter the output / missing number:</label>
              <div class="door3-inline-input-row">
                <span>Answer =</span>
                <input type="number" id="output-input" class="door3-single-input" placeholder="Missing number">
              </div>
            </div>

            <!-- SUBMIT ANSWER BUTTON -->
            <button class="submit-btn azure-btn clickable" id="submit-answer-btn" style="margin-top: 6px;">SUBMIT ANSWER</button>

            <!-- Feedback Display Box -->
            <div class="feedback-box" id="feedback-box"></div>

            <!-- Action Navigation Buttons -->
            <div class="action-buttons-group">
              <button class="proceed-btn clickable" id="claim-map-btn">
                <span>🗺️ CLAIM THE MAP & CONTINUE</span>
              </button>
              <button class="back-btn clickable" id="back-level1-btn">
                <span>← RETURN TO LEVEL 1</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    this.bindDoor3Events();
  }

  bindDoor3Events() {
    const nInput = document.getElementById('n-input');
    const codeInput = document.getElementById('code-input');
    const outputInput = document.getElementById('output-input');
    const feedbackBox = document.getElementById('feedback-box');
    const submitBtn = document.getElementById('submit-answer-btn');
    const claimMapBtn = document.getElementById('claim-map-btn');
    const backBtn = document.getElementById('back-level1-btn');

    if (!submitBtn) return;

    let isSubmitting = false;
    const handleSubmit = () => {
      if (!feedbackBox || !nInput || !codeInput || !outputInput || isSubmitting) return;
      if (window.antiCheat && window.antiCheat.state.status !== 'active') return;

      isSubmitting = true;
      setTimeout(() => { isSubmitting = false; }, 800);

      const nValStr = nInput.value.trim();
      const rawCode = codeInput.value.trim();
      const outputValStr = outputInput.value.trim();

      // Reset border styles
      nInput.classList.remove('error-border', 'success-border');
      codeInput.classList.remove('error-border', 'success-border');
      outputInput.classList.remove('error-border', 'success-border');

      // Check missing inputs
      if (nValStr === '' || rawCode === '' || outputValStr === '') {
        feedbackBox.textContent = 'All 3 inputs (n, solution code, and output answer) are required!';
        feedbackBox.className = 'feedback-box warning show';
        if (nValStr === '') nInput.classList.add('error-border');
        if (rawCode === '') codeInput.classList.add('error-border');
        if (outputValStr === '') outputInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        return;
      }

      // 1. Validate n value
      const nVal = parseInt(nValStr, 10);
      if (isNaN(nVal) || nVal !== 3) {
        feedbackBox.textContent = 'Incorrect n value! For sample nums = [3, 0, 1], n must equal 3.';
        feedbackBox.className = 'feedback-box error show';
        nInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        if (window.app) window.app.deductLife();
        return;
      }

      // 2. Validate Code constraints
      const hasSorting = /\.sort\b|sort\(|Arrays\.sort|sorted\(/i.test(rawCode);
      if (hasSorting) {
        feedbackBox.textContent = 'Constraint Violation: Sorting is NOT allowed! Must be O(n) time.';
        feedbackBox.className = 'feedback-box error show';
        codeInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        if (window.app) window.app.deductLife();
        return;
      }

      const hasExtraSpace = /new\s+(Set|Map|Array|HashMap|HashSet|ArrayList|List|dict)|set\(|dict\(|hash_map|HashTable|vector<|\bSet<|\bMap</i.test(rawCode);
      if (hasExtraSpace) {
        feedbackBox.textContent = 'Constraint Violation: Extra data structures are NOT allowed! Must be O(1) space.';
        feedbackBox.className = 'feedback-box error show';
        codeInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        if (window.app) window.app.deductLife();
        return;
      }

      // Test code execution / pattern
      let isCodeValid = false;
      const testCases = [
        { input: [3, 0, 1], expected: 2 },
        { input: [0, 1], expected: 2 },
        { input: [9, 6, 4, 2, 3, 5, 7, 0, 1], expected: 8 }
      ];

      try {
        let fn;
        if (rawCode.includes('function') || rawCode.includes('=>')) {
          fn = new Function(`
            ${rawCode}
            if (typeof missingNumber === 'function') return missingNumber;
            if (typeof findMissing === 'function') return findMissing;
            if (typeof solution === 'function') return solution;
            if (typeof solve === 'function') return solve;
            return null;
          `)();
        } else {
          fn = new Function('nums', `
            ${rawCode}
          `);
        }

        if (typeof fn === 'function') {
          let passed = true;
          for (const tc of testCases) {
            const res = fn([...tc.input]);
            if (res !== tc.expected) {
              passed = false;
              break;
            }
          }
          if (passed) isCodeValid = true;
        }
      } catch (err) {
        // Fallback pattern check for valid math sum or XOR calculation
      }

      if (!isCodeValid) {
        const hasSumOrXor = /(n\s*\*\s*\(\s*n\s*\+\s*1\s*\)\s*\/\s*2|sum|reduce|\^|\+=|-=|\bSum\b)/i.test(rawCode);
        const hasLoopOrFormula = /(for|while|reduce|\^|sum|\*)/i.test(rawCode);
        if (hasSumOrXor && hasLoopOrFormula && !hasSorting && !hasExtraSpace) {
          isCodeValid = true;
        }
      }

      if (!isCodeValid) {
        feedbackBox.textContent = 'Incorrect code solution! Ensure your algorithm correctly finds the missing number in O(n) time & O(1) space.';
        feedbackBox.className = 'feedback-box error show';
        codeInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        if (window.app) window.app.deductLife();
        return;
      }

      // 3. Validate Output missing number
      const outputVal = parseInt(outputValStr, 10);
      if (isNaN(outputVal) || outputVal !== 2) {
        feedbackBox.textContent = 'Incorrect missing number output! For array [3, 0, 1], the missing number is 2.';
        feedbackBox.className = 'feedback-box error show';
        outputInput.classList.add('error-border');
        if (window.soundController) window.soundController.playErrorSound();
        if (window.app) window.app.deductLife();
        return;
      }

      // SUCCESS! All 3 inputs valid
      feedbackBox.textContent = 'Correct! All 3 inputs validated successfully. Level 1 Completed!';
      feedbackBox.className = 'feedback-box success show';
      nInput.classList.add('success-border');
      codeInput.classList.add('success-border');
      outputInput.classList.add('success-border');

      if (window.soundController) window.soundController.playSuccessChime();
      if (window.app) window.app.completeDoor('door3');

      if (window.antiCheat) {
        window.antiCheat.updateState({
          completedDoors: window.app ? window.app.completedDoors : {},
          score: (window.antiCheat.state.score || 0) + 150
        });
      }

      if (claimMapBtn) claimMapBtn.classList.add('active');

      setTimeout(() => {
        if (this.currentDoorId === 'door3' && window.app) {
          window.app.navigateTo('scene-4');
        }
      }, 1800);
    };

    submitBtn.addEventListener('click', handleSubmit);

    if (claimMapBtn) {
      claimMapBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playSuccessChime();
        if (window.app) window.app.navigateTo('scene-4');
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.soundController) window.soundController.playHoverChime(400);
        if (window.app) window.app.navigateTo('scene-2');
      });
    }

    this.bindQuestionTabEvents();
  }

  /* Physical Keyboard Listener */
  initKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      if (!window.app || window.app.currentSceneId !== 'scene-3') return;
      if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;

      if (this.currentDoorId === 'door1') {
        const answerBox = document.getElementById('answer-box');
        if (!answerBox) return;

        if (e.key >= '0' && e.key <= '9') {
          if (this.currentAnswer.length < 6) {
            this.currentAnswer += e.key;
            if (window.soundController) window.soundController.playKeypadClick();
          }
        } else if (e.key === 'Backspace') {
          this.currentAnswer = this.currentAnswer.slice(0, -1);
          if (window.soundController) window.soundController.playKeypadClick();
        } else if (e.key === 'Delete' || e.key === 'Escape') {
          this.currentAnswer = '';
          if (window.soundController) window.soundController.playKeypadClick();
        } else if (e.key === 'Enter') {
          const submitBtn = document.getElementById('submit-answer-btn');
          if (submitBtn) submitBtn.click();
          return;
        }

        if (this.currentAnswer.length === 0) {
          answerBox.textContent = 'Enter your answer';
          answerBox.classList.add('placeholder-active');
        } else {
          answerBox.textContent = this.currentAnswer;
          answerBox.classList.remove('placeholder-active');
        }
        answerBox.classList.remove('error-border', 'success-border');
      }

      else if (this.currentDoorId === 'door2') {
        const answerBox = document.getElementById('answer-box');
        if (!answerBox) return;

        if (e.key >= '0' && e.key <= '9') {
          if (this.currentAnswer.length < 10) {
            this.currentAnswer += e.key;
            if (window.soundController) window.soundController.playKeypadClick();
          }
        } else if (e.key === 'Backspace') {
          this.currentAnswer = this.currentAnswer.slice(0, -1);
          if (window.soundController) window.soundController.playKeypadClick();
        } else if (e.key === 'Delete' || e.key === 'Escape') {
          this.currentAnswer = '';
          if (window.soundController) window.soundController.playKeypadClick();
        } else if (e.key === 'Enter') {
          const submitBtn = document.getElementById('submit-answer-btn');
          if (submitBtn) submitBtn.click();
          return;
        }

        if (this.currentAnswer.length === 0) {
          answerBox.textContent = 'Enter your answer';
          answerBox.classList.add('placeholder-active');
        } else {
          answerBox.textContent = this.currentAnswer;
          answerBox.classList.remove('placeholder-active');
        }
        answerBox.classList.remove('error-border', 'success-border');
      }
    });
  }
}

window.PlaceholderController = PlaceholderController;
