/* ==========================================================================
   SCENE 1: ANCIENT CAVE DOOR LOGIC & ZOOM ANIMATION
   ========================================================================== */

class Scene1Controller {
  constructor() {
    this.sceneEl = document.getElementById('scene-1');
    this.enterBtn = document.getElementById('enter-btn');
    this.isTransitioning = false;
    this.initEvents();
  }

  init() {
    if (!this.sceneEl) return;
    
    // Start camera zoom sequence after short render delay
    setTimeout(() => {
      this.sceneEl.classList.add('zooming');
    }, 200);
  }

  initEvents() {
    if (!this.enterBtn) return;

    // Hover sound effect
    this.enterBtn.addEventListener('mouseenter', () => {
      if (window.soundController) {
        window.soundController.init();
        window.soundController.playHoverChime(520);
      }
    });

    // Click handler for ENTER IF YOU DARE
    this.enterBtn.addEventListener('click', () => {
      if (this.isTransitioning) return;

      const proceedToGame = () => {
        this.isTransitioning = true;

        if (window.soundController) {
          window.soundController.init();
          window.soundController.playDoorOpenSound();
        }

        // Trigger door opening camera zoom and split
        this.sceneEl.classList.add('opening');

        // Trigger dark transition flash overlay after zoom completes
        const flash = document.getElementById('flash-overlay');
        if (flash) {
          setTimeout(() => {
            flash.classList.add('active');
          }, 1200);
        }

        // Complete navigation to Level 1
        setTimeout(() => {
          if (window.app) {
            window.app.navigateTo('scene-2');
          }
          if (flash) {
            flash.classList.remove('active');
          }
          this.isTransitioning = false;
          this.sceneEl.classList.remove('opening');
        }, 2000);
      };

      if (window.antiCheat && window.antiCheat.state.status === 'not_started') {
        window.antiCheat.showRulesNoticeModal(proceedToGame);
      } else {
        if (window.antiCheat) window.antiCheat.startAttempt();
        proceedToGame();
      }
    });
  }
}

window.Scene1Controller = Scene1Controller;
