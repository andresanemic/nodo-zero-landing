/* ═══════════════════════════════════════════════════════════
   SPACE BACKGROUND — Three.js starfield + nebulae
   ═══════════════════════════════════════════════════════════ */

export class SpaceBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === 'undefined') {
      this._fallback();
      return;
    }

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.rafId = null;
    this.isLowPower = this._detectLowPower();

    this._initScene();
    this._createStarLayers();
    this._createNebula();
    this._bindEvents();
    this._animate();
  }

  _detectLowPower() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false;
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
    return renderer.includes('software') || renderer.includes('llvm');
  }

  _initScene() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 2000
    );
    this.camera.position.z = 500;

    this.clock = new THREE.Clock();
  }

  _createStarLayers() {
    const starCounts = this.isLowPower
      ? [600, 300, 100]
      : [2000, 800, 300];
    const speeds    = [0.03, 0.08, 0.18];
    const sizes     = [0.6, 1.0, 1.8];
    const alphas    = [0.5, 0.75, 1.0];

    this.starLayers = [];

    starCounts.forEach((count, i) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);

      for (let j = 0; j < count; j++) {
        positions[j * 3]     = (Math.random() - 0.5) * 2000;
        positions[j * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[j * 3 + 2] = (Math.random() - 0.5) * 1000 - 200;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: sizes[i],
        transparent: true,
        opacity: alphas[i],
        sizeAttenuation: true,
        depthWrite: false,
      });

      const stars = new THREE.Points(geometry, material);
      stars.userData = { speed: speeds[i], parallaxFactor: (i + 1) * 0.15 };
      this.scene.add(stars);
      this.starLayers.push(stars);
    });

  }

  _createNebula() {
    if (this.isLowPower) return;

    const count = 600;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 200 + Math.random() * 400;
      const theta  = Math.random() * Math.PI * 2;
      const phi    = (Math.random() - 0.5) * Math.PI;

      pos[i * 3]     = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi) * 0.5;
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 300;

      /* Colour: green to blue gradient */
      const t = Math.random();
      col[i * 3]     = t * 0.04;
      col[i * 3 + 1] = 0.3 + t * 0.5;
      col[i * 3 + 2] = 0.2 + (1 - t) * 0.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 4, vertexColors: true, transparent: true,
      opacity: 0.15, sizeAttenuation: true, depthWrite: false,
    });

    this.nebula = new THREE.Points(geo, mat);
    this.scene.add(this.nebula);
  }

  _bindEvents() {
    const onMouseMove = e => {
      this.targetMouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    this._cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }

  _animate() {
    this.rafId = requestAnimationFrame(() => this._animate());

    const t = this.clock.getElapsedTime();

    /* Smooth mouse interpolation */
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    /* Rotate star layers */
    this.starLayers.forEach(layer => {
      layer.rotation.y += layer.userData.speed * 0.001;
      layer.position.x  = this.mouse.x * layer.userData.parallaxFactor * -15;
      layer.position.y  = this.mouse.y * layer.userData.parallaxFactor * 10;
    });

    /* Nebula slow drift */
    if (this.nebula) {
      this.nebula.rotation.y += 0.0003;
      this.nebula.rotation.x += 0.0001;
    }

    /* Camera subtle drift */
    this.camera.position.x += (this.mouse.x * 8 - this.camera.position.x) * 0.02;
    this.camera.position.y += (-this.mouse.y * 6 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  _fallback() {
    /* CSS-only particle fallback */
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    canvas.style.display = 'none';

    const wrapper = canvas.parentElement;
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position:absolute;inset:0;
      background: radial-gradient(ellipse 80% 60% at 30% 40%, rgba(0,30,20,0.8), transparent),
                  radial-gradient(ellipse 60% 80% at 70% 60%, rgba(0,10,40,0.6), transparent),
                  #0b0b0f;
    `;
    wrapper.appendChild(fallback);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this._cleanup) this._cleanup();
    if (this.renderer) this.renderer.dispose();
  }
}
