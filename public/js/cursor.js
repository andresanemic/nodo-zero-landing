/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR — dot + ring + particle trail
   ═══════════════════════════════════════════════════════════ */

export class CustomCursor {
  constructor() {
    /* Skip on touch devices */
    if (window.matchMedia('(pointer: coarse)').matches) return;

    this.dot   = document.getElementById('cursor-dot');
    this.ring  = document.getElementById('cursor-ring');
    this.trail = document.getElementById('cursor-trail');

    if (!this.dot || !this.ring || !this.trail) return;

    this.pos    = { x: -100, y: -100 };
    this.target = { x: -100, y: -100 };
    this.ringPos = { x: -100, y: -100 };
    this.particles = [];
    this.maxParticles = 40;
    this.rafId = null;
    this.isVisible = false;

    this._initCanvas();
    this._bindEvents();
    this._animate();
  }

  _initCanvas() {
    this.ctx = this.trail.getContext('2d');
    this.trail.width  = window.innerWidth;
    this.trail.height = window.innerHeight;

    window.addEventListener('resize', () => {
      this.trail.width  = window.innerWidth;
      this.trail.height = window.innerHeight;
    }, { passive: true });
  }

  _bindEvents() {
    document.addEventListener('mousemove', e => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;

      if (!this.isVisible) {
        this.pos.x    = e.clientX;
        this.pos.y    = e.clientY;
        this.ringPos.x = e.clientX;
        this.ringPos.y = e.clientY;
        this.isVisible = true;
        document.body.classList.remove('cursor-out');
      }

      /* Spawn trail particle */
      this._spawnParticle(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.body.classList.add('cursor-out');
      this.isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      document.body.classList.remove('cursor-out');
      this.isVisible = true;
    });

    /* Hover states */
    document.addEventListener('mouseover', e => {
      const el = e.target;
      if (!el) return;

      const tag = el.tagName.toLowerCase();
      const isClickable = el.matches('a, button, [role="button"], .project-card, .ally-node, .nav-dot, .pillar-card, .team-card, .social-link, .hero-scroll-cta');
      const isDraggable = el.matches('.projects-track, #projects-track');
      const isText = el.matches('p, h1, h2, h3, h4, span');

      document.body.classList.toggle('cursor-hover', isClickable && !isDraggable);
      document.body.classList.toggle('cursor-drag', isDraggable);
      document.body.classList.toggle('cursor-text', isText && !isClickable);
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-click');
      setTimeout(() => document.body.classList.remove('cursor-click'), 400);
    });
  }

  _spawnParticle(x, y) {
    const angle  = Math.random() * Math.PI * 2;
    const speed  = 0.5 + Math.random() * 1.5;
    const life   = 0.6 + Math.random() * 0.4;
    const size   = 1.5 + Math.random() * 2.5;
    const hue    = Math.random() > 0.7 ? 160 : 210; /* green or blue */

    this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, size, hue });

    if (this.particles.length > this.maxParticles) this.particles.shift();
  }

  _animate() {
    this.rafId = requestAnimationFrame(() => this._animate());

    /* Smooth dot follow */
    this.pos.x += (this.target.x - this.pos.x) * 0.85;
    this.pos.y += (this.target.y - this.pos.y) * 0.85;

    /* Ring follows with lag */
    this.ringPos.x += (this.target.x - this.ringPos.x) * 0.12;
    this.ringPos.y += (this.target.y - this.ringPos.y) * 0.12;

    /* Apply positions */
    const dotTf  = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;
    const ringTf = `translate(${this.ringPos.x}px, ${this.ringPos.y}px) translate(-50%, -50%)`;
    this.dot.style.transform  = dotTf;
    this.ring.style.transform = ringTf;

    /* Draw trail particles */
    this._drawParticles();
  }

  _drawParticles() {
    const { ctx, trail } = this;
    ctx.clearRect(0, 0, trail.width, trail.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x   += p.vx;
      p.y   += p.vy;
      p.vx  *= 0.95;
      p.vy  *= 0.95;
      p.life -= 0.03;

      if (p.life <= 0) { this.particles.splice(i, 1); continue; }

      const alpha = (p.life / p.maxLife) * 0.7;
      const size  = p.size * (p.life / p.maxLife);

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha})`;
      ctx.fill();
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
