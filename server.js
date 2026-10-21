const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist', 'emitta-frontend-angular', 'browser');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // 1. Manejo de Preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    res.end();
    return;
  }

  // 2. Proxy para /api hacia api-emitta.nexorf.dev (sin encabezados origin/referer)
  if (req.url.startsWith('/api')) {
    const targetHost = 'api-emitta.nexorf.dev';
    const headers = { ...req.headers };
    headers['host'] = targetHost;
    delete headers['origin'];
    delete headers['referer'];

    const proxyReq = https.request({
      hostname: targetHost,
      port: 443,
      path: req.url,
      method: req.method,
      headers: headers
    }, (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers };
      responseHeaders['access-control-allow-origin'] = '*';
      responseHeaders['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      responseHeaders['access-control-allow-headers'] = '*';
      res.writeHead(proxyRes.statusCode, responseHeaders);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy error', details: err.message }));
      }
    });

    req.pipe(proxyReq);
    return;
  }

  // 3. Servir archivos estáticos de Angular
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let filePath = path.join(DIST, decodeURIComponent(parsedUrl.pathname));

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // 4. Fallback SPA: responder index.html para rutas Angular (/pos, /documentos, etc.)
      const indexPath = path.join(DIST, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(indexPath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`POS Emitta Server corriendo en puerto ${PORT}`);
});
