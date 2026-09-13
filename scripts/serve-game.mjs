import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const match = path.match(/^\/(competition\/dist|work\/extracted)\/(index\.html|game\.js)?$/);
  if (!match) { res.writeHead(404); return res.end('Not found'); }
  try {
    const file = `${match[1]}/${match[2] || 'index.html'}`;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('Game: http://127.0.0.1:4173/competition/dist/'));
