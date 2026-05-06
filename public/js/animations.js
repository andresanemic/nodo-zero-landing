/* ═══════════════════════════════════════════════════════════
   ANIMATIONS — GSAP ScrollTrigger orchestration
   ═══════════════════════════════════════════════════════════ */

export class Animations {
  constructor() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded — animations disabled');
      this._showAllElements();
      return;
    }

    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    this._heroEntrance();
    this._aboutPillars();
    this._eventSection();
    this._teamCards();
    this._alliesSection();
    this._ctaSection();
    this._scrollProgress();
    this._sideNavHighlight();
    this._pillarParticles();
  }

  /* ── Utility: show all if GSAP missing ── */
  _showAllElements() {
    document.querySelectorAll(
      '[data-gsap], .tagline-line, .pillar-card, .team-card,' +
      '.event-badge, .event-title-line, .event-subtitle, .event-meta,' +
      '.event-highlight, .event-audience, .event-ctas, .event-right,' +
      '.cta-line, .hero-logo, .hero-subtitle, .hero-scroll-cta, .hero-stats'
    ).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── HERO ENTRANCE ── */
  _heroEntrance() {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.from('.hero-logo', {
      opacity: 0, y: 20, duration: 0.9, ease: 'expo.out',
    });
    tl.from('.tagline-line', {
      opacity: 0, y: 30, duration: 0.8, ease: 'expo.out', stagger: 0.12,
    }, '-=0.4');
    tl.from('.hero-subtitle', {
      opacity: 0, y: 20, duration: 0.7, ease: 'expo.out',
    }, '-=0.3');
    tl.from('.hero-scroll-cta', {
      opacity: 0, y: 10, duration: 0.7, ease: 'expo.out',
    }, '-=0.3');
  }

  /* ── ABOUT / PILLARS ── */
  _aboutPillars() {
    gsap.from('#about .section-header', {
      scrollTrigger: { trigger: '#about', start: 'top 80%', toggleActions: 'play none none none' },
      y: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
    });

    document.querySelectorAll('.pillar-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        opacity: 0, y: 40, duration: 0.8,
        delay: i * 0.15,
        ease: 'expo.out',
      });
    });

    document.querySelectorAll('.pillar-icon path, .pillar-icon circle, .pillar-icon rect').forEach(path => {
      if (path.getTotalLength) {
        try {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            scrollTrigger: { trigger: path.closest('.pillar-card'), start: 'top 80%' },
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'expo.out',
          });
        } catch (_) { /* SVG element without getTotalLength — skip */ }
      }
    });
  }

  /* ── EVENT SECTION — Seminario de Economía Digital ── */
  _eventSection() {
    gsap.from('#event .section-header', {
      scrollTrigger: { trigger: '#event', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
    });

    /* Badge + title lines */
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#event', start: 'top 68%' },
    });

    tl.from('.event-badge', { opacity: 0, y: 10, duration: 0.6, ease: 'expo.out' })
      .from('.event-title-line', {
        opacity: 0, y: 22, duration: 0.75, ease: 'expo.out', stagger: 0.1,
      }, '-=0.3')
      .from('.event-subtitle', { opacity: 0, y: 14, duration: 0.6, ease: 'expo.out' }, '-=0.3')
      .from('.event-meta', { opacity: 0, y: 14, duration: 0.6, ease: 'expo.out' }, '-=0.25');

    /* Audience + CTAs */
    gsap.from(['.event-audience', '.event-ctas'], {
      scrollTrigger: { trigger: '.event-audience', start: 'top 88%' },
      opacity: 0, y: 10, duration: 0.7, ease: 'expo.out',
      stagger: 0.12,
    });

    /* Right card slides in */
    gsap.from('.event-right', {
      scrollTrigger: { trigger: '.event-grid', start: 'top 72%' },
      opacity: 0, x: 28, duration: 1.0, ease: 'expo.out',
    });

    /* Register button pulse on hover */
    const regBtn = document.querySelector('.btn--event');
    if (regBtn) {
      regBtn.addEventListener('mouseenter', () => {
        gsap.to(regBtn, { scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
      });
      regBtn.addEventListener('mouseleave', () => {
        gsap.to(regBtn, { scale: 1, duration: 0.4, ease: 'expo.out' });
      });

      /* Particle burst on click */
      regBtn.addEventListener('click', () => {
        this._particleBurst(regBtn);
      });
    }
  }

  _particleBurst(el) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('span');
      p.style.cssText = `
        position:fixed;pointer-events:none;z-index:9999;
        width:4px;height:4px;border-radius:50%;
        background:#00FF88;
        left:${rect.left + rect.width / 2}px;
        top:${rect.top + rect.height / 2}px;
      `;
      document.body.appendChild(p);
      gsap.to(p, {
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 80 - 30,
        opacity: 0, scale: 0,
        duration: 0.7 + Math.random() * 0.4,
        ease: 'expo.out',
        onComplete: () => p.remove(),
      });
    }
  }

  /* ── TEAM CARDS ── */
  _teamCards() {
    gsap.from('#team .section-header', {
      scrollTrigger: { trigger: '#team', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
    });

    document.querySelectorAll('.team-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        opacity: 0, y: 40, duration: 0.9,
        delay: i * 0.18,
        ease: 'expo.out',
      });
    });
  }

  /* ── ALLIES / CONSTELLATION ── */
  _alliesSection() {
    gsap.from('#allies .section-header', {
      scrollTrigger: { trigger: '#allies', start: 'top 80%' },
      y: 40, opacity: 0, duration: 0.9, ease: 'expo.out',
    });

    gsap.from('.ally-node', {
      scrollTrigger: { trigger: '.allies-grid', start: 'top 80%' },
      opacity: 0, scale: 0.6, y: 20,
      duration: 0.7, ease: 'back.out(1.5)',
      stagger: { each: 0.1, from: 'random' },
      onComplete: () => this._drawConstellationLines(),
    });
  }

  _drawConstellationLines() {
    const svg   = document.getElementById('constellation-svg');
    const nodes = document.querySelectorAll('.ally-node');
    if (!svg || !nodes.length) return;

    const wrap  = document.getElementById('constellation-wrap');
    const wRect = wrap.getBoundingClientRect();

    const centers = Array.from(nodes).map(node => {
      const r = node.getBoundingClientRect();
      return {
        x: r.left + r.width  / 2 - wRect.left,
        y: r.top  + r.height / 2 - wRect.top,
        node,
      };
    });

    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${wRect.width} ${wRect.height}`);

    centers.forEach((a, i) => {
      const nearest = centers
        .map((b, j) => ({ j, d: Math.hypot(b.x - a.x, b.y - a.y) }))
        .filter(d => d.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);

      nearest.forEach(({ j }) => {
        if (j > i) {
          const b    = centers[j];
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
          line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
          line.setAttribute('stroke', 'rgba(0,255,136,0.12)');
          line.setAttribute('stroke-width', '1');
          line.setAttribute('stroke-dasharray', '4 6');
          svg.appendChild(line);

          const len = Math.hypot(b.x - a.x, b.y - a.y);
          gsap.from(line, { strokeDashoffset: len, duration: 1.2, ease: 'expo.out' });

          [a.node, b.node].forEach(n => {
            n.addEventListener('mouseenter', () => {
              gsap.to(line, { attr: { stroke: 'rgba(0,255,136,0.5)' }, duration: 0.3 });
            });
            n.addEventListener('mouseleave', () => {
              gsap.to(line, { attr: { stroke: 'rgba(0,255,136,0.12)' }, duration: 0.4 });
            });
          });
        }
      });
    });
  }

  /* ── CTA SECTION ── */
  _ctaSection() {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '#cta', start: 'top 75%' },
    });

    tl.from('.cta-label',    { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' })
      .from('.cta-line',     { opacity: 0, y: 40, duration: 0.9, ease: 'expo.out', stagger: 0.15 }, '-=0.3')
      .from('.cta-subtitle', { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' }, '-=0.4')
      .from('.cta-buttons',  { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' }, '-=0.3');

    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        gsap.to(btn, { scale: 1.04, duration: 0.3, ease: 'back.out(2)' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { scale: 1, duration: 0.4, ease: 'expo.out' });
      });
    });
  }

  /* ── SCROLL PROGRESS BAR ── */
  _scrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  }

  /* ── SIDE NAV HIGHLIGHT ── */
  _sideNavHighlight() {
    const sections = ['hero', 'about', 'event', 'team', 'allies', 'cta'];
    const dots     = document.querySelectorAll('.nav-dot');

    sections.forEach((id, i) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter:     () => this._setActiveDot(dots, i),
        onEnterBack: () => this._setActiveDot(dots, i),
      });
    });
  }

  _setActiveDot(dots, activeIndex) {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
  }

  /* ── PILLAR PARTICLE BURST on hover ── */
  _pillarParticles() {
    document.querySelectorAll('.pillar-card').forEach(card => {
      const container = card.querySelector('.pillar-particles');
      if (!container) return;

      card.addEventListener('mouseenter', () => {
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('span');
          p.style.cssText = `
            position:absolute;
            width:3px; height:3px;
            border-radius:50%;
            background:#00FF88;
            pointer-events:none;
            left:${20 + Math.random() * 60}%;
            top:${20 + Math.random() * 60}%;
          `;
          container.appendChild(p);
          gsap.to(p, {
            x: (Math.random() - 0.5) * 80,
            y: (Math.random() - 0.5) * 80,
            opacity: 0, scale: 0,
            duration: 0.8 + Math.random() * 0.4,
            ease: 'expo.out',
            onComplete: () => p.remove(),
          });
        }
      });
    });
  }
}
