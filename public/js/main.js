/* ═══════════════════════════════════════════════════════════
   MAIN — Orchestrator
   Waits for GSAP + Three.js CDN scripts, then boots modules
   ═══════════════════════════════════════════════════════════ */

import { SpaceBackground } from './space-background.js';
import { CustomCursor }    from './cursor.js';
import { Animations }      from './animations.js';
import { ScrollHandler }   from './scroll.js';

/* ── Wait for deferred CDN scripts ── */
function waitForLibs(timeout = 6000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const gsapReady  = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
      const threeReady = typeof THREE !== 'undefined';
      if (gsapReady && threeReady) return resolve();
      if (Date.now() - start > timeout) return resolve(); /* Proceed anyway with fallbacks */
      requestAnimationFrame(check);
    };
    check();
  });
}

/* ── Boot sequence ── */
async function init() {
  await waitForLibs();

  /* Cursor first (no deps) */
  const cursor = new CustomCursor();

  /* Three.js space background */
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
}

/* ── Entry point ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
