/* ═══════════════════════════════════════════════════════════
   MAIN — Orchestrator
   Waits for GSAP + Three.js CDN scripts, then boots modules
   ═══════════════════════════════════════════════════════════ */

import { SpaceBackground } from './space-background.js';
import { CustomCursor }    from './cursor.js';
import { Animations }      from './animations.js';
import { ScrollHandler }   from './scroll.js';

/* ── Wait for GSAP CDN scripts ── */
function waitForGsap(timeout = 4000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') return resolve();
      if (Date.now() - start > timeout) return resolve();
      requestAnimationFrame(check);
    };
    check();
  });
}

/* ── Boot sequence ── */
async function init() {
  try {
    await waitForGsap();

    /* Cursor first (no deps) */
    const cursor = new CustomCursor();

    /* Three.js space background (non-blocking — THREE may or may not be ready) */
    const space = new SpaceBackground('space-canvas');

    /* Scroll behaviour (drag, particles) */
    const scroll = new ScrollHandler();

    /* GSAP animations */
    const animations = new Animations();

    /* Lazy: refresh ScrollTrigger after fonts load */
    document.fonts.ready.then(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });

    /* Clean up on page unload */
    window.addEventListener('beforeunload', () => {
      cursor.destroy?.();
      space.destroy?.();
    });
  } catch (err) {
    console.error('Nodo Zero init error:', err);
  }
}

/* ── Entry point ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
