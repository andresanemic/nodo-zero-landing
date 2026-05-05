# Nodo Zero — Landing Page

> El primer laboratorio blockchain universitario de Chile.

## Stack

- **HTML5** semántico + **CSS3** (grid, variables, animations)
- **Three.js** — starfield 3D + nodo de red interactivo
- **GSAP** + ScrollTrigger — animaciones por scroll
- **Vanilla JS** (ES modules) — cursor, drag, partículas
- **Node.js** + Express — servidor estático

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm start
# → http://localhost:3000

# 3. Modo desarrollo (auto-reload)
npm run dev
```

## Deploy en Vercel

```bash
npm i -g vercel
vercel
```

La configuración usa `server.js` como punto de entrada. Vercel lo detecta automáticamente.

## Deploy en Netlify

1. Crear `netlify.toml` en la raíz:
```toml
[build]
  publish = "."
  command = "echo done"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
2. Arrastrar la carpeta a [app.netlify.com](https://app.netlify.com) o usar CLI: `netlify deploy --prod`

## Estructura

```
nodo-zero-landing/
├── index.html          ← Toda la estructura HTML
├── server.js           ← Express (sirve archivos estáticos)
├── package.json
│
└── public/
    ├── css/
    │   ├── main.css        ← Variables, secciones, componentes
    │   ├── cursor.css      ← Cursor custom + estados hover
    │   └── responsive.css  ← Breakpoints 1440 / 1024 / 768 / 480px
    │
    ├── js/
    │   ├── main.js             ← Orchestrator (ES module entry)
    │   ├── space-background.js ← Three.js starfield + red animada
    │   ├── cursor.js           ← Cursor + trail de partículas
    │   ├── animations.js       ← GSAP ScrollTrigger
    │   └── scroll.js           ← Drag projects, CTA particles
    │
    └── assets/
        ├── images/
        │   ├── team/       ← Fotos del equipo (agregar aquí)
        │   └── projects/   ← Íconos de proyectos
        └── fonts/          ← Fuentes locales opcionales
```

## Personalización rápida

### Colores (CSS variables en `main.css`)
```css
:root {
  --green:  #00FF88;   /* verde neón primario */
  --blue:   #0A7AFF;   /* azul tech secundario */
  --cream:  #FFF8F0;   /* texto */
  --bg:     #0B0B0F;   /* fondo negro espacial */
}
```

### Añadir fotos del equipo
Reemplazar los `<div class="team-photo-placeholder">` con `<img>` en `index.html`:
```html
<img src="public/assets/images/team/pablo.webp" alt="Pablo Guzmán" />
```

### Ajustar conteo de estrellas (performance)
En `space-background.js`, cambiar `starCounts` dentro de `_createStarLayers()`.

### Añadir más proyectos
Copiar un bloque `<article class="project-card">` en `index.html` y ajustar `--card-color`.

## Performance

- Three.js carga diferida con `defer`
- GSAP carga diferida con `defer`
- Detección automática de GPU de baja potencia → menos partículas
- `prefers-reduced-motion` respetado vía CSS
- Canvas de trail con `mix-blend-mode: screen` (GPU compositing)

## Requisitos de producción

- Node.js 18+
- Puerto 3000 (configurable via `PORT` env var)
