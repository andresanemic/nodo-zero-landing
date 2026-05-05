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
    this._createNetworkNode();
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

    /* Occasional green-tinted stars */
    if (!this.isLowPower) {
      const greenGeo  = new THREE.BufferGeometry();
      const greenPos  = new Float32Array(120 * 3);
      for (let j = 0; j < 120; j++) {
        greenPos[j * 3]     = (Math.random() - 0.5) * 2000;
        greenPos[j * 3 + 1] = (Math.random() - 0.5) * 2000;
        greenPos[j * 3 + 2] = (Math.random() - 0.5) * 800;
      }
      greenGeo.setAttribute('position', new THREE.BufferAttribute(greenPos, 3));
      const greenMat = new THREE.PointsMaterial({
        color: 0x00ff88, size: 1.2, transparent: true,
        opacity: 0.6, sizeAttenuation: true, depthWrite: false,
      });
      const greenStars = new THREE.Points(greenGeo, greenMat);
      greenStars.userData = { speed: 0.04, parallaxFactor: 0.1 };
      this.scene.add(greenStars);
      this.starLayers.push(greenStars);
    }
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

  _createNetworkNode() {
    /* Floating network node visible behind hero content */
    const group = new THREE.Group();

    /* Central sphere */
    const sphereGeo = new THREE.SphereGeometry(18, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88, transparent: true, opacity: 0.08, wireframe: false,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    /* Wireframe overlay */
    const wireGeo = new THREE.SphereGeometry(18, 12, 8);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88, wireframe: true, transparent: true, opacity: 0.25,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);

    /* Orbiting rings */
    const ringData = [
      { r: 34, tube: 0.3, rot: [0.4, 0, 0],   color: 0x00ff88, opacity: 0.4 },
      { r: 46, tube: 0.2, rot: [0, 0.3, 0.8], color: 0x0a7aff, opacity: 0.3 },
      { r: 58, tube: 0.15, rot: [1.1, 0.5, 0], color: 0x00d9a0, opacity: 0.25 },
    ];

    this.rings = [];
    ringData.forEach(d => {
      const geo = new THREE.TorusGeometry(d.r, d.tube, 8, 80);
      const mat = new THREE.MeshBasicMaterial({
        color: d.color, transparent: true, opacity: d.opacity,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(...d.rot);
      ring.userData.rotSpeed = {
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.004,
        z: (Math.random() - 0.5) * 0.002,
      };
      group.add(ring);
      this.rings.push(ring);
    });

    /* Satellite nodes */
    const nodePositions = [
      [50, 20, 0], [-40, -30, 20], [10, 55, -10],
      [-30, 40, -30], [45, -40, 15], [-55, 10, 5],
    ];

    nodePositions.forEach(pos => {
      const geo = new THREE.SphereGeometry(2.5, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00ff88, transparent: true, opacity: 0.8,
      });
      const node = new THREE.Mesh(geo, mat);
      node.position.set(...pos);

      /* Line to center */
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...pos),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00ff88, transparent: true, opacity: 0.2,
      });
      group.add(new THREE.Line(lineGeo, lineMat));
      group.add(node);
    });

    group.position.set(0, 0, -100);
    this.networkNode = group;
    this.scene.add(group);
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

    /* Network node */
    if (this.networkNode) {
      this.networkNode.rotation.y = t * 0.12 + this.mouse.x * 0.3;
      this.networkNode.rotation.x = Math.sin(t * 0.08) * 0.2 + this.mouse.y * 0.2;

      this.rings.forEach(ring => {
        ring.rotation.x += ring.userData.rotSpeed.x;
        ring.rotation.y += ring.userData.rotSpeed.y;
        ring.rotation.z += ring.userData.rotSpeed.z;
      });
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
