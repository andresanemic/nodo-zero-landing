/* ═══════════════════════════════════════════════════════════
   SCROLL — drag-to-scroll for project track + CTA particles
   ═══════════════════════════════════════════════════════════ */

export class ScrollHandler {
  constructor() {
    this._initProjectsDrag();
    this._initHeroParticles();
    this._initCtaParticles();
    this._initSmoothAnchorScroll();
  }

  /* ── Drag-to-scroll on projects track ── */
  _initProjectsDrag() {
    const track = document.getElementById('projects-track');
    if (!track) return;

    let isDown = false;
    let startX, scrollLeft;

    track.addEventListener('mousedown', e => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX     = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.6;
      track.scrollLeft = scrollLeft - walk;
    });

    /* Touch support */
    let touchStartX, touchScrollLeft;

    track.addEventListener('touchstart', e => {
      touchStartX    = e.touches[0].pageX;
      touchScrollLeft = track.scrollLeft;
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      const x    = e.touches[0].pageX;
      const walk = (touchStartX - x) * 1.4;
      track.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });
  }

  /* ── Floating hero particles (CSS-powered via JS) ── */
  _initHeroParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 15 : 35;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const size     = 1 + Math.random() * 3;
      const x        = Math.random() * 100;
      const y        = Math.random() * 100;
      const duration = 6 + Math.random() * 12;
      const delay    = Math.random() * -10;
      const color    = Math.random() > 0.6 ? '#00FF88' : '#0A7AFF';
      const opacity  = 0.2 + Math.random() * 0.5;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        left: ${x}%;
        top: ${y}%;
        opacity: ${opacity};
        animation: heroFloat ${duration}s ${delay}s ease-in-out infinite;
        pointer-events: none;
      `;
      container.appendChild(particle);
    }

    /* Inject keyframe if not present */
    if (!document.getElementById('hero-float-keyframe')) {
      const style = document.createElement('style');
      style.id = 'hero-float-keyframe';
      style.textContent = `
        @keyframes heroFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: var(--op, 0.4); }
          33%  { transform: translate(${this._rnd()}px, ${this._rnd(-30, -10)}px) scale(1.2); }
          66%  { transform: translate(${this._rnd()}px, ${this._rnd(10, 30)}px) scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  _rnd(min = -20, max = 20) {
    return min + Math.random() * (max - min);
  }

  /* ── CTA Section Particle Canvas ── */
  _initCtaParticles() {
    const canvas = document.getElementById('cta-particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h, particles = [], rafId;

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      h = canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* Only run when in viewport */
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!particles.length) this._seedCtaParticles(particles, w, h);
        this._animCtaParticles(ctx, particles, w, h, rafId);
      } else {
        if (rafId) cancelAnimationFrame(rafId);
      }
    }, { threshold: 0.1 });

    observer.observe(canvas.closest('section'));

    /* Mouse interaction */
    let mouse = { x: w / 2, y: h / 2 };
    canvas.closest('section').addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      /* Repel nearby particles */
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }
      });
    }, { passive: true });
  }

  _seedCtaParticles(particles, w, h) {
    const count = Math.min(60, Math.floor(w * h / 12000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x:    Math.random() * w,
        y:    Math.random() * h,
        vx:   (Math.random() - 0.5) * 0.4,
        vy:   (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2.5,
        hue:  Math.random() > 0.5 ? 150 : 210,
        alpha: 0.2 + Math.random() * 0.5,
      });
    }
  }

  _animCtaParticles(ctx, particles, w, h, rafId) {
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        /* Bounce off edges */
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.alpha})`;
        ctx.fill();
      });

      /* Connect nearby particles */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,136,${(1 - dist / 120) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    loop();
  }

  /* ── Smooth anchor scroll with offset ── */
  _initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}
