/* ==========================================================================
   ANCIENT PIRATE CAVE ADVENTURE - APP CONTROLLER & SHARED LIVES SYSTEM
   ========================================================================== */

class App {
  constructor() {
    this.currentSceneId = 'scene-1';
    this.selectedDoor = 'door1';
    
    // 1. Shared Lives State (Max 5, shared across all doors)
    const savedLives = localStorage.getItem('pirate_lives');
    this.lives = savedLives !== null ? parseInt(savedLives, 10) : 5;

    // 2. Unlocked doors state
    const savedUnlocked = localStorage.getItem('pirate_unlocked_doors');
    this.unlockedDoors = savedUnlocked ? JSON.parse(savedUnlocked) : {
      door1: true,
      door2: false,
      door3: false
    };

    // 3. Completed doors state
    const savedCompleted = localStorage.getItem('pirate_completed_doors');
    this.completedDoors = savedCompleted ? JSON.parse(savedCompleted) : {
      door1: false,
      door2: false,
      door3: false
    };

    // 4. Level 2 completion state
    const savedLevel2 = localStorage.getItem('pirate_level2_completed');
    this.level2Completed = savedLevel2 === 'true';

    // Guarantee Level 1 starts at Door 1 unless Door 3 map is unlocked
    if (!this.completedDoors.door3) {
      this.unlockedDoors = { door1: true, door2: !!this.completedDoors.door1, door3: !!this.completedDoors.door2 };
    }

    this.scene1Controller = null;
    this.scene2Controller = null;
    this.placeholderController = null;
    this.particles = null;

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  init() {
    // Instantiate background particles
    if (window.ParticleSystem) {
      this.particles = new window.ParticleSystem('particle-canvas');
    }

    // Instantiate scene controllers
    if (window.Scene1Controller) {
      this.scene1Controller = new window.Scene1Controller();
    }
    if (window.Scene2Controller) {
      this.scene2Controller = new window.Scene2Controller();
    }
    if (window.PlaceholderController) {
      this.placeholderController = new window.PlaceholderController();
    }
    if (window.Level2Controller) {
      this.level2Controller = new window.Level2Controller();
    }
    if (window.Level3Controller) {
      this.level3Controller = new window.Level3Controller();
    }

    // Audio Mute/Unmute HUD Controller
    const audioBtn = document.getElementById('toggle-audio-btn');
    const audioStatusText = document.getElementById('audio-status-text');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (window.soundController) {
          window.soundController.init();
          const isMuted = window.soundController.toggleMute();
          if (audioStatusText) {
            audioStatusText.textContent = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
          }
        }
      });
    }

    // Map Screen NEXT Button Controller -> Level 2
    const mapNextBtn = document.getElementById('map-next-btn');
    if (mapNextBtn) {
      mapNextBtn.addEventListener('mouseenter', () => {
        if (window.soundController) window.soundController.playHoverChime(580);
      });

      mapNextBtn.addEventListener('click', () => {
        if (!this.isDoorCompleted('door3')) {
          this.showToast('Solve Door 3 first to unlock Level 2!');
          return;
        }

        if (window.soundController) {
          window.soundController.playDoorOpenSound();
        }

        const flash = document.getElementById('flash-overlay');
        if (flash) {
          flash.classList.add('active');
          setTimeout(() => {
            this.navigateTo('scene-5');
            flash.classList.remove('active');
          }, 800);
        } else {
          this.navigateTo('scene-5');
        }
      });
    }

    // Apply initial HUD state and Door Lock UI
    this.updateLivesHUD();
    this.updateDoorLockUI();

    // Start Scene 1
    this.navigateTo('scene-1');
  }

  /* ==========================================================================
     SHARED LIVES SYSTEM METHODS
     ========================================================================== */
  updateLivesHUD() {
    const livesTextEls = document.querySelectorAll('.lives-text');
    livesTextEls.forEach(el => {
      el.textContent = `LIVES ${this.lives}/5`;
    });
  }

  deductLife() {
    if (this.lives <= 0) return 0;

    this.lives = Math.max(0, this.lives - 1);
    localStorage.setItem('pirate_lives', this.lives.toString());

    if (window.antiCheat) {
      window.antiCheat.updateState({ lives: this.lives });
    }

    this.updateLivesHUD();

    // Animate HUD with red flash and shake
    const livesHud = document.getElementById('lives-hud');
    if (livesHud) {
      livesHud.classList.add('shake-flash');
      setTimeout(() => livesHud.classList.remove('shake-flash'), 600);
    }

    // Show warning toast if lives remain
    if (this.lives > 0) {
      this.showToast('Careful, pirate! One life lost!');
    } else {
      // Game Over reached
      if (window.antiCheat) {
        window.antiCheat.updateState({ status: 'lost', lives: 0 });
      }
      setTimeout(() => this.triggerGameOver(), 700);
    }

    return this.lives;
  }

  resetGame() {
    if (window.antiCheat && window.antiCheat.state.status === 'disqualified') {
      this.showToast('Attempt is permanently locked following disqualification.');
      window.antiCheat.showDisqualificationOverlay();
      return;
    }

    this.lives = 5;
    this.unlockedDoors = { door1: true, door2: false, door3: false };
    this.completedDoors = { door1: false, door2: false, door3: false };
    
    this.level2Completed = false;
    localStorage.setItem('pirate_lives', '5');
    localStorage.setItem('pirate_unlocked_doors', JSON.stringify(this.unlockedDoors));
    localStorage.setItem('pirate_completed_doors', JSON.stringify(this.completedDoors));
    localStorage.removeItem('pirate_level2_completed');

    this.updateLivesHUD();
    this.updateDoorLockUI();

    // Hide Game Over screen if visible
    const gameOverOverlay = document.getElementById('game-over-overlay');
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('active');
    }

    // Navigate to Scene 1
    this.navigateTo('scene-1');
  }

  triggerGameOver() {
    if (window.soundController) {
      window.soundController.playErrorSound();
    }

    let gameOverOverlay = document.getElementById('game-over-overlay');
    if (!gameOverOverlay) {
      gameOverOverlay = document.createElement('div');
      gameOverOverlay.id = 'game-over-overlay';
      gameOverOverlay.className = 'game-over-overlay';
      document.body.appendChild(gameOverOverlay);
    }

    gameOverOverlay.innerHTML = `
      <div class="game-over-content">
        <div class="trap-collapse-visual">
          <div class="shadow-figure">☠️</div>
          <div class="crumbling-rocks"></div>
        </div>
        
        <h1 class="game-over-title">GAME OVER</h1>
        
        <p class="game-over-message">
          “Five chances gone, chinnoda! The cave claims another pirate. Your treasure hunt ends here!”
        </p>

        <button id="restart-adventure-btn" class="restart-btn clickable">
          <span>🔄 RESTART ADVENTURE</span>
        </button>
      </div>
    `;

    setTimeout(() => {
      gameOverOverlay.classList.add('active');

      const restartBtn = document.getElementById('restart-adventure-btn');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          if (window.soundController) window.soundController.playDoorOpenSound();
          this.resetGame();
        });
      }
    }, 100);
  }

  /* ==========================================================================
     DOOR UNLOCK & PROGRESSION STATE MANAGEMENT
     ========================================================================== */
  isDoorUnlocked(doorId) {
    return !!this.unlockedDoors[doorId];
  }

  isDoorCompleted(doorId) {
    return !!this.completedDoors[doorId];
  }

  unlockDoor(doorId) {
    this.unlockedDoors[doorId] = true;
    if (doorId === 'door2') this.completedDoors.door1 = true;
    if (doorId === 'door3') this.completedDoors.door2 = true;
    localStorage.setItem('pirate_unlocked_doors', JSON.stringify(this.unlockedDoors));
    localStorage.setItem('pirate_completed_doors', JSON.stringify(this.completedDoors));
    this.updateDoorLockUI();
  }

  completeDoor(doorId) {
    this.completedDoors[doorId] = true;
    localStorage.setItem('pirate_completed_doors', JSON.stringify(this.completedDoors));
  }

  completeLevel2() {
    this.level2Completed = true;
    localStorage.setItem('pirate_level2_completed', 'true');
  }

  getNextTargetDoor() {
    if (!this.completedDoors.door1) {
      return 'door1';
    } else if (!this.completedDoors.door2) {
      return 'door2';
    } else if (!this.completedDoors.door3) {
      return 'door3';
    } else {
      return 'door1';
    }
  }

  updateDoorLockUI() {
    const doorCards = document.querySelectorAll('.door-card');
    doorCards.forEach(card => {
      const doorId = card.dataset.door;
      const isUnlocked = this.isDoorUnlocked(doorId);

      const existingBadge = card.querySelector('.lock-badge');
      if (existingBadge) existingBadge.remove();

      if (isUnlocked) {
        card.classList.remove('locked');
      } else {
        card.classList.add('locked');
        const badge = document.createElement('div');
        badge.className = 'lock-badge';
        badge.innerHTML = '🔒 LOCKED';
        card.appendChild(badge);
      }
    });
  }

  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    if (window.soundController) {
      window.soundController.playErrorSound();
    }

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  setSelectedDoor(doorId) {
    this.selectedDoor = doorId;
    if (this.placeholderController) {
      this.placeholderController.updateView(doorId);
    }
  }

  navigateTo(sceneId) {
    // If out of lives, block navigation to levels
    if (this.lives <= 0 && sceneId !== 'scene-1') {
      this.triggerGameOver();
      return;
    }

    // Prevent navigation to Level 2 (scene-5) unless Level 1 is completed (door3 solved)
    if (sceneId === 'scene-5' && (!this.completedDoors || !this.completedDoors.door3)) {
      this.showToast('Complete Level 1 first to unlock Level 2!');
      return;
    }

    // Prevent navigation to Level 3 (scene-8/scene-9) unless Level 2 is completed
    if ((sceneId === 'scene-8' || sceneId === 'scene-9') && !this.level2Completed) {
      this.showToast('Complete Level 2 Suguru first to unlock Level 3!');
      return;
    }

    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
      if (scene.id === sceneId) {
        scene.classList.add('active');
      } else {
        scene.classList.remove('active');
      }
    });

    this.currentSceneId = sceneId;

    if (sceneId === 'scene-1' && this.scene1Controller) {
      this.scene1Controller.init();
    } else if (sceneId === 'scene-2' && this.scene2Controller) {
      this.scene2Controller.init();
    } else if (sceneId === 'scene-5' && this.level2Controller) {
      this.level2Controller.initLevel2Landing();
    } else if (sceneId === 'scene-8') {
      const scene8El = document.getElementById('scene-8');
      if (scene8El) scene8El.scrollTop = 0;
    } else if (sceneId === 'scene-9' && this.level3Controller) {
      this.level3Controller.initLevel3Intro();
    }
  }
}

window.app = new App();
