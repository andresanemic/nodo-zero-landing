const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

/* Serve /public/* static assets */
app.use('/public', express.static(path.join(ROOT, 'public')));

/* Favicon shortcut */
app.get('/favicon.svg', (req, res) =>
  res.sendFile(path.join(ROOT, 'public', 'favicon.svg'))
);

/* All routes → index.html (SPA behaviour) */
app.get('*', (req, res) =>
  res.sendFile(path.join(ROOT, 'index.html'))
);

/* Local dev server */
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Nodo Zero → http://localhost:${PORT}`)
  );
}

/* Vercel serverless export */
module.exports = app;
