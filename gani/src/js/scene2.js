/* ==========================================================================
   SCENE 2: LEVEL 1 PAGE LOGIC & DOOR LOCK ENFORCEMENT
   ========================================================================== */

class Scene2Controller {
  constructor() {
    this.sceneEl = document.getElementById('scene-2');
    this.typewriterTextEl = document.getElementById('typewriter-text');
    this.doorsContainer = document.getElementById('doors-container');
    this.doorCards = document.querySelectorAll('.door-card');
    
    this.fullText = "Three ancient doors stand before you. Each hides a trial designed to test your mind and courage. Choose wisely. Every decision brings you closer to the treasure... or deeper into danger.";
    
    this.typingInterval = null;
    this.isTyping = false;
    this.isTransitioning = false;

    this.initEvents();
  }

  init() {
    if (!this.sceneEl) return;
    if (window.app) window.app.updateDoorLockUI();
    this.startTypewriter();
  }

  startTypewriter() {
    if (!this.typewriterTextEl) return;

    this.typewriterTextEl.innerHTML = '';
    const nextBtnContainer = document.getElementById('next-btn-container');
    if (this.doorsContainer) {
      this.doorsContainer.classList.remove('revealed');
    }
    if (nextBtnContainer) {
      nextBtnContainer.classList.remove('revealed');
    }
    
    let index = 0;
    this.isTyping = true;

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    
    if (this.typingInterval) clearInterval(this.typingInterval);

    this.typingInterval = setInterval(() => {
      if (index < this.fullText.length) {
        const char = this.fullText.charAt(index);
        
        if (cursor.parentNode === this.typewriterTextEl) {
          this.typewriterTextEl.removeChild(cursor);
        }
        this.typewriterTextEl.appendChild(document.createTextNode(char));
        this.typewriterTextEl.appendChild(cursor);
        
        if (index % 2 === 0 && window.soundController) {
          window.soundController.playTypewriterTick();
        }

        index++;
      } else {
        clearInterval(this.typingInterval);
        this.isTyping = false;

        setTimeout(() => {
          if (this.doorsContainer) {
            this.doorsContainer.classList.add('revealed');
          }
          if (nextBtnContainer) {
            nextBtnContainer.classList.add('revealed');
          }
          if (window.soundController) {
            window.soundController.playHoverChime(660);
          }
        }, 600);
      }
    }, 30);
  }

  initEvents() {
    this.doorCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const selectedDoorId = card.dataset.door;
        const isUnlocked = window.app ? window.app.isDoorUnlocked(selectedDoorId) : true;
        if (window.soundController && isUnlocked) {
          const freqMap = { door1: 440, door2: 550, door3: 660 };
          window.soundController.playHoverChime(freqMap[selectedDoorId] || 500);
        }
      });

      card.addEventListener('click', (e) => {
        e.preventDefault();
        // Door clicks must NOT open question screens or trigger question actions
      });
    });

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('mouseenter', () => {
        if (window.soundController) {
          window.soundController.playHoverChime(580);
        }
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNextClick();
      });
    }
  }

  handleNextClick() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Determine target door based on existing progression state:
    // Door 1 -> Door 2 (once Door 1 solved) -> Door 3 (once Door 2 solved)
    let targetDoor = 'door1';
    if (window.app && typeof window.app.getNextTargetDoor === 'function') {
      targetDoor = window.app.getNextTargetDoor();
    } else if (window.app) {
      if (window.app.isDoorCompleted && window.app.isDoorCompleted('door2')) {
        targetDoor = 'door3';
      } else if (window.app.isDoorCompleted && window.app.isDoorCompleted('door1')) {
        targetDoor = 'door2';
      } else {
        targetDoor = 'door1';
      }
    }

    if (window.soundController) {
      window.soundController.playDoorOpenSound();
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.classList.add('selecting');
    }

    const flash = document.getElementById('flash-overlay');
    if (flash) {
      setTimeout(() => flash.classList.add('active'), 600);
    }

    setTimeout(() => {
      if (window.app) {
        window.app.setSelectedDoor(targetDoor);
        window.app.navigateTo('scene-3');
      }
      if (flash) {
        flash.classList.remove('active');
      }
      if (nextBtn) {
        nextBtn.classList.remove('selecting');
      }
      this.isTransitioning = false;
    }, 1300);
  }
}

window.Scene2Controller = Scene2Controller;
