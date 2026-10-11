// Verification helper only. Not included in the upload ZIP or deployed site.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const prefix = '/archive-review/';
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.wasm':'application/wasm', '.svg':'image/svg+xml', '.txt':'text/plain' };
createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
    let target = resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!target.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(request.method === 'HEAD' ? undefined : data);
    console.log(`200 ${pathname}`);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log(`Static-only test: http://127.0.0.1:4173${prefix}`));
