const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;
const distPath = path.join(__dirname, 'dist', 'emitta-frontend-angular', 'browser');

// Proxy transparente para /api -> https://api-emitta.nexorf.dev/api
// Elimina los encabezados origin y referer para que el servidor Spring Boot
// no rechace la petición con 403 "Invalid CORS request".
app.use('/api', (req, res) => {
  const targetHost = 'api-emitta.nexorf.dev';
  const targetPath = '/api' + req.url;

  const headers = { ...req.headers };
  headers['host'] = targetHost;
  delete headers['origin'];
  delete headers['referer'];

  const options = {
    hostname: targetHost,
    port: 443,
    path: targetPath,
    method: req.method,
    headers: headers
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Permitir CORS al cliente si fuera necesario
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Error comunicando con API Emitta', details: err.message });
    }
  });

  req.pipe(proxyReq, { end: true });
});

// Servir estáticos de Angular
app.use(express.static(distPath));

// Cualquier otra ruta SPA responde index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor POS Emitta corriendo en puerto ${PORT}`);
});
