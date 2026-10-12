/* ==========================================================================
   ANCIENT PIRATE CAVE ADVENTURE - ANTI-CHEATING & MALPRACTICE PREVENTION MODULE
   ========================================================================== */

class AntiCheatManager {
  constructor() {
    this.STORAGE_KEY = 'pirate_anticheat_state';
    this.CHANNEL_NAME = 'pirate_anticheat_channel';
    this.SESSION_ACTIVE_KEY = 'pirate_active_session_flag';

    this.tabId = 'TAB_' + Math.random().toString(36).substr(2, 9);
    this.lastViolationTime = 0;

    // Load or initialize authoritative game state
    this.state = this.loadState();

    // BroadcastChannel for multi-tab synchronization
    this.broadcastChannel = null;
    this.initBroadcastChannel();

    // Attach security & detection event listeners
    this.initListeners();

    // Check for reload / existing elimination on startup
    this.checkInitialSessionState();
  }

  /* ==========================================================================
     1. STATE PERSISTENCE & SCHEMAS
     ========================================================================== */
  loadState() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('LocalStorage error in anti-cheat manager:', e);
    }

    return {
      attemptId: 'ATTEMPT_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      participantId: 'PIRATE_' + Math.random().toString(36).substr(2, 7).toUpperCase(),
      status: 'not_started', // 'not_started' | 'active' | 'won' | 'lost' | 'completed' | 'disqualified'
      startTime: null,
      timerDeadline: null,
      currentQuestion: 'door1',
      questionSeed: 'SEED_' + Date.now().toString(36),
      submittedAnswers: {},
      score: 0,
      warningCount: 0,
      maxWarnings: 3,
      violations: [],
      disqualificationReason: null,
      disqualificationTime: null,
      completionTime: null,
      currentScene: 'scene-1',
      lives: 5,
      unlockedDoors: { door1: true, door2: false, door3: false },
      completedDoors: { door1: false, door2: false, door3: false },
      level2Completed: false,
      activeTabId: null
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save anti-cheat state:', e);
    }
  }

  updateState(updates) {
    Object.assign(this.state, updates);
    this.saveState();
  }

  /* ==========================================================================
     2. REFRESH & RELOAD DETECTION
     ========================================================================== */
  checkInitialSessionState() {
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === 'reload';
      } else if (window.performance && window.performance.navigation) {
        isReload = window.performance.navigation.type === 1;
      }
    } catch (e) {
      isReload = false;
    }

    const wasSessionActive = sessionStorage.getItem(this.SESSION_ACTIVE_KEY) === 'true';

    // If game was ACTIVE and page reloaded: eliminate player
    if (this.state.status === 'active' && (isReload || wasSessionActive)) {
      this.disqualifyPlayer('Page reload / refresh during active game detected');
      return;
    }

    // If already eliminated/disqualified, enforce terminal elimination screen
    if (this.state.status === 'disqualified') {
      document.addEventListener('DOMContentLoaded', () => {
        this.showEliminationOverlay();
        this.lockGameUI();
      });
      return;
    }

    // If already completed or lost, enforce locked state
    if (this.state.status === 'completed' || this.state.status === 'won' || this.state.status === 'lost') {
      document.addEventListener('DOMContentLoaded', () => {
        this.lockGameUI();
      });
      return;
    }
  }

  startAttempt() {
    if (this.state.status === 'disqualified' || this.state.status === 'completed' || this.state.status === 'won') {
      return false;
    }

    this.state.status = 'active';
    this.state.startTime = this.state.startTime || Date.now();
    this.state.activeTabId = this.tabId;
    sessionStorage.setItem(this.SESSION_ACTIVE_KEY, 'true');
    this.saveState();

    // Trap browser back/forward buttons
    history.pushState(null, '', location.href);

    this.broadcastMessage({ type: 'ATTEMPT_STARTED', attemptId: this.state.attemptId, tabId: this.tabId });
    return true;
  }

  /* ==========================================================================
     3. UNIFIED VIOLATION TRACKER (TAB SWITCHING, PROHIBITED SHORTCUTS, COPY-PASTE)
     ========================================================================== */
  recordViolation(reason = 'Rule violation detected') {
    if (this.state.status !== 'active') return;

    const now = Date.now();
    // Debounce to prevent 1 action (like blur + visibilitychange) from counting twice (1.2s threshold)
    if (now - this.lastViolationTime < 1200) {
      return;
    }
    this.lastViolationTime = now;

    this.state.warningCount += 1;
    const count = this.state.warningCount;

    const violationEntry = {
      reason: reason,
      timestamp: new Date().toLocaleTimeString() + ', ' + new Date().toLocaleDateString(),
      warningNum: count
    };
    this.state.violations.push(violationEntry);
    this.saveState();

    this.updateHUDWarningCount();

    if (count >= 4) {
      this.disqualifyPlayer('Repeated violations of the game rules.');
    } else {
      this.showWarningModal(count);
    }
  }

  updateHUDWarningCount() {
    const warningTextEl = document.getElementById('warning-hud-text');
    const warningHudEl = document.getElementById('warning-hud');

    if (warningTextEl) {
      warningTextEl.textContent = `WARNINGS ${this.state.warningCount}/3`;
    }
    if (warningHudEl) {
      if (this.state.warningCount > 0) {
        warningHudEl.classList.add('has-warnings');
      } else {
        warningHudEl.classList.remove('has-warnings');
      }
    }
  }

  showWarningModal(count) {
    let warningModal = document.getElementById('anticheat-warning-modal');
    if (!warningModal) {
      warningModal = document.createElement('div');
      warningModal.id = 'anticheat-warning-modal';
      warningModal.className = 'anticheat-modal-overlay';
      document.body.appendChild(warningModal);
    }

    let warningTitle = '';
    let warningMessage = '';

    if (count === 1) {
      warningTitle = 'WARNING 1/3';
      warningMessage = 'WARNING 1/3: Tab switching or copy-paste is not allowed. Continue playing fairly.';
    } else if (count === 2) {
      warningTitle = 'WARNING 2/3';
      warningMessage = 'WARNING 2/3: This is your second violation. One more warning remains before elimination.';
    } else if (count === 3) {
      warningTitle = 'FINAL WARNING 3/3';
      warningMessage = 'FINAL WARNING 3/3: One more violation will eliminate you from the game.';
    }

    warningModal.innerHTML = `
      <div class="anticheat-modal-card warning-theme">
        <div class="anticheat-modal-header">
          <span class="warning-icon-large">⚠️</span>
          <h2>${warningTitle}</h2>
        </div>
        <div class="anticheat-modal-body">
          <p class="warning-exact-text">${warningMessage}</p>
          <div class="violation-count-badge">Total Violations: <strong>${count} / 3</strong></div>
        </div>
        <div class="anticheat-modal-footer">
          <button id="acknowledge-warning-btn" class="anticheat-btn warning-btn">I ACKNOWLEDGE & RESUME</button>
        </div>
      </div>
    `;

    warningModal.classList.add('active');

    const ackBtn = document.getElementById('acknowledge-warning-btn');
    if (ackBtn) {
      ackBtn.onclick = () => {
        warningModal.classList.remove('active');
      };
    }
  }

  /* ==========================================================================
     4. DETECTORS & SHORTCUT RESTRICTIONS
     ========================================================================== */
  initListeners() {
    // 1. Page Visibility API & Blur/Focus events
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.status === 'active') {
        this.recordViolation('Switched tab or minimized browser window');
      }
    });

    window.addEventListener('blur', () => {
      if (this.state.status === 'active' && document.activeElement && document.activeElement.tagName === 'IFRAME') {
        return;
      }
      if (this.state.status === 'active') {
        this.recordViolation('Left game window or changed focus');
      }
    });

    // 2. Keyboard Shortcuts Interception (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, DevTools)
    window.addEventListener('keydown', (e) => {
      if (this.state.status !== 'active') return;

      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      const targetTag = e.target ? e.target.tagName : '';

      // Allow normal typing inside input or textarea unless it is a prohibited shortcut
      const isInputOrTextarea = targetTag === 'INPUT' || targetTag === 'TEXTAREA';

      // Prohibited Shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      const isCopy = ctrlOrCmd && key === 'c';
      const isPaste = ctrlOrCmd && key === 'v';
      const isCut = ctrlOrCmd && key === 'x';
      const isSelectAll = ctrlOrCmd && key === 'a';

      // DevTools Shortcuts
      const isF12 = key === 'f12' || code === 'F12';
      const isCtrlShiftDev = ctrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || key === 'k');
      const isViewSource = ctrlOrCmd && key === 'u';
      const isMacDev = e.metaKey && e.altKey && (key === 'i' || key === 'j' || key === 'c');

      if (isCopy || isPaste || isCut || isSelectAll) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation(`Prohibited shortcut used (${isCopy ? 'Copy' : isPaste ? 'Paste' : isCut ? 'Cut' : 'Select All'})`);
        return false;
      }

      if (isF12 || isCtrlShiftDev || isViewSource || isMacDev) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('Prohibited developer tools shortcut used');
        return false;
      }
    }, true);

    // 3. Context Menu Right-Click Prevention
    document.addEventListener('contextmenu', (e) => {
      if (this.state.status === 'active') {
        e.preventDefault();
        this.showToast('Right-click inspection is disabled.');
        return false;
      }
    });

    // 4. Clipboard Events (copy, cut, paste)
    document.addEventListener('copy', (e) => this.handleClipboardEvent(e, 'Copy'));
    document.addEventListener('cut', (e) => this.handleClipboardEvent(e, 'Cut'));
    document.addEventListener('paste', (e) => this.handleClipboardEvent(e, 'Paste'));
    document.addEventListener('dragstart', (e) => this.handleClipboardEvent(e, 'Drag'));

    // 5. Browser Back/Forward navigation trap
    window.addEventListener('popstate', () => {
      if (this.state.status === 'active') {
        history.pushState(null, '', location.href);
        this.showToast('Browser navigation is restricted during gameplay.');
      }
    });
  }

  handleClipboardEvent(e, actionName) {
    if (this.state.status !== 'active') return;
    e.preventDefault();
    this.recordViolation(`Prohibited ${actionName} action attempted`);
  }

  /* ==========================================================================
     5. MULTI-TAB & BROADCAST CHANNEL SYNCHRONIZATION
     ========================================================================== */
  initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY && e.newValue) {
        const newState = JSON.parse(e.newValue);
        if (newState.status === 'disqualified' && this.state.status !== 'disqualified') {
          this.state = newState;
          this.showEliminationOverlay();
          this.lockGameUI();
        }
      }
    });

    setInterval(() => {
      if (this.state.status === 'active') {
        this.broadcastMessage({ type: 'HEARTBEAT', attemptId: this.state.attemptId, tabId: this.tabId });
      }
    }, 2000);
  }

  broadcastMessage(msg) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {}
    }
  }

  handleBroadcastMessage(data) {
    if (!data) return;

    if (data.type === 'HEARTBEAT' && data.attemptId === this.state.attemptId && data.tabId !== this.tabId) {
      if (this.state.status === 'active') {
        this.showDuplicateTabOverlay();
      }
    } else if (data.type === 'STATUS_CHANGE' && data.attemptId === this.state.attemptId) {
      if (data.status === 'disqualified') {
        this.state.status = 'disqualified';
        this.state.disqualificationReason = data.reason;
        this.showEliminationOverlay();
        this.lockGameUI();
      }
    }
  }

  showDuplicateTabOverlay() {
    let dupOverlay = document.getElementById('duplicate-session-overlay');
    if (!dupOverlay) {
      dupOverlay = document.createElement('div');
      dupOverlay.id = 'duplicate-session-overlay';
      dupOverlay.className = 'anticheat-modal-overlay active';
      document.body.appendChild(dupOverlay);
    }

    dupOverlay.innerHTML = `
      <div class="anticheat-modal-card danger-theme">
        <div class="anticheat-modal-header">
          <span class="warning-icon-large">🚫</span>
          <h2>DUPLICATE SESSION DETECTED</h2>
        </div>
        <div class="anticheat-modal-body">
          <p>This attempt (<strong>${this.state.attemptId}</strong>) is already running in another browser tab or window.</p>
          <p class="sub-text">Simultaneous tabs are not permitted. Please close this tab and return to your original game window.</p>
        </div>
      </div>
    `;
    this.lockGameUI();
  }

  /* ==========================================================================
     6. CENTRALIZED ELIMINATION / DISQUALIFICATION FUNCTION
     ========================================================================== */
  disqualifyPlayer(reason) {
    this.eliminatePlayer(reason);
  }

  eliminatePlayer(reason = 'Repeated violations of the game rules.') {
    // Idempotent execution
    if (this.state.status === 'disqualified') {
      this.showEliminationOverlay();
      this.lockGameUI();
      return;
    }

    this.state.status = 'disqualified';
    this.state.disqualificationReason = reason;
    this.state.disqualificationTime = new Date().toLocaleTimeString() + ', ' + new Date().toLocaleDateString();
    this.saveState();

    sessionStorage.removeItem(this.SESSION_ACTIVE_KEY);

    this.broadcastMessage({
      type: 'STATUS_CHANGE',
      attemptId: this.state.attemptId,
      status: 'disqualified',
      reason: reason
    });

    if (window.soundController) {
      window.soundController.playErrorSound();
    }

    this.showEliminationOverlay();
    this.lockGameUI();
  }

  showEliminationOverlay() {
    let overlay = document.getElementById('disqualification-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'disqualification-overlay';
      overlay.className = 'disqualification-overlay';
      document.body.appendChild(overlay);
    }

    const reason = this.state.disqualificationReason || 'Repeated violations of the game rules.';
    const time = this.state.disqualificationTime || new Date().toLocaleTimeString();
    const warnings = this.state.warningCount || 4;

    const timeStr = (() => {
      if (this.state.timerDeadline) {
        const remaining = Math.max(0, Math.floor((this.state.timerDeadline - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return '58:32';
    })();
    const abortFormUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeUpUa8EBYo9gbR0QG6Xt0KFcRvUIhFNLBKexNiA_nIYD3ucA/viewform?usp=pp_url&entry.637509370=${encodeURIComponent(timeStr)}`;

    overlay.innerHTML = `
      <div class="disqualification-card">
        <div class="dq-skull-badge">☠️</div>
        <h1 class="dq-title">YOU HAVE BEEN ELIMINATED</h1>
        <p class="dq-subtitle">Reason: ${reason}</p>
        
        <div class="dq-details-table">
          <div class="dq-row"><span class="dq-label">Attempt ID:</span><span class="dq-val">${this.state.attemptId}</span></div>
          <div class="dq-row"><span class="dq-label">Participant ID:</span><span class="dq-val">${this.state.participantId}</span></div>
          <div class="dq-row"><span class="dq-label">Total Recorded Violations:</span><span class="dq-val highlight-reason">${warnings}</span></div>
          <div class="dq-row"><span class="dq-label">Recorded Time:</span><span class="dq-val" style="color: #ffd700; font-weight: bold;">⏱️ ${timeStr}</span></div>
        </div>

        <div style="margin: 20px 0;">
          <a href="${abortFormUrl}" target="_blank" rel="noopener noreferrer" class="proceed-btn" style="display: block; text-decoration: none; text-align: center; background: linear-gradient(135deg, #ff2a4b, #990000); color: #fff; padding: 14px 24px; border-radius: 8px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 0 20px rgba(255,42,75,0.6);">
            📋 FILL TRIAL REPORT FORM ➔
          </a>
          <p style="font-size: 0.8rem; color: #ffb3c0; margin-top: 8px; text-align: center;">Recorded time (${timeStr}) is prefilled automatically.</p>
        </div>

        <div class="dq-notice-box">
          <p>🔒 <strong>ATTEMPT TERMINATED:</strong> Answering, navigation, and all gameplay controls are permanently disabled.</p>
        </div>
      </div>
    `;

    setTimeout(() => overlay.classList.add('active'), 50);
  }

  lockGameUI() {
    const clickables = document.querySelectorAll('button, input, textarea, .clickable, .door-card');
    clickables.forEach(el => {
      el.disabled = true;
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.5';
    });
  }

  /* ==========================================================================
     7. PRE-GAME ANTI-CHEAT RULES NOTICE MODAL
     ========================================================================== */
  showRulesNoticeModal(onAgreeCallback) {
    let rulesModal = document.getElementById('anticheat-rules-modal');
    if (!rulesModal) {
      rulesModal = document.createElement('div');
      rulesModal.id = 'anticheat-rules-modal';
      rulesModal.className = 'anticheat-modal-overlay';
      document.body.appendChild(rulesModal);
    }

    rulesModal.innerHTML = `
      <div class="anticheat-modal-card rules-theme">
        <div class="anticheat-modal-header">
          <span class="warning-icon-large">📜</span>
          <h2>ASSESSMENT & ANTI-CHEATING RULES</h2>
        </div>
        <div class="anticheat-modal-body">
          <p class="rules-intro">Before entering the Forbidden Cave, review and agree to the anti-cheating regulations:</p>
          <ul class="rules-checklist">
            <li><strong>Single Attempt Only:</strong> You have 1 permitted attempt. Progress is saved continuously.</li>
            <li><strong>No Refresh / Reload:</strong> Refreshing or reloading the page during active gameplay results in immediate elimination.</li>
            <li><strong>Tab Switching & Copy-Paste Prohibited:</strong> Maximum 3 warnings are allowed across tab switches and copy-paste shortcuts. A 4th violation results in elimination.</li>
            <li><strong>Single Active Window:</strong> Running the game in multiple browser tabs or windows is forbidden.</li>
          </ul>
          <p class="rules-footnote">Attempt ID: <code>${this.state.attemptId}</code></p>
        </div>
        <div class="anticheat-modal-footer">
          <button id="start-attempt-btn" class="anticheat-btn success-btn">I AGREE & START ATTEMPT</button>
        </div>
      </div>
    `;

    rulesModal.classList.add('active');

    const startBtn = document.getElementById('start-attempt-btn');
    if (startBtn) {
      startBtn.onclick = () => {
        rulesModal.classList.remove('active');
        this.startAttempt();
        if (typeof onAgreeCallback === 'function') {
          onAgreeCallback();
        }
      };
    }
  }

  showToast(msg) {
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(msg);
    } else {
      let toast = document.getElementById('anticheat-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'anticheat-toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  }
}

window.AntiCheatManager = AntiCheatManager;
window.antiCheat = new AntiCheatManager();
