/* ==========================================================================
   FLOATING CAVE EMBERS & MIST PARTICLES CANVAS
   ========================================================================== */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 65;
    this.resize();
    this.initParticles();
    
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2.2 + 0.5,
        color: this.getRandomParticleColor(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2, // Float upwards like warm embers
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  getRandomParticleColor() {
    const colors = [
      '#ffcc00', // Gold ember
      '#ff4400', // Crimson ember
      '#ff9900', // Warm torch amber
      '#00d9ff', // Ethereal azure mist mote
      '#ffffff'  // Dust particle
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.2;
      p.y += p.vy;
      p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;

      // Wrap around canvas edges
      if (p.y < 0) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;

      // Render glowing particle
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(this.animate);
  }
}

window.ParticleSystem = ParticleSystem;
