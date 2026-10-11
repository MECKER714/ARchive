import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
const html = await readFile('dist/index.html', 'utf8');
assert(html.includes('Content-Security-Policy'));
assert(html.includes("connect-src 'self' blob: data:"));
assert(!/127\.0\.0\.1|localhost|\/src\//.test(html));
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) await stat(`dist/${match[1].slice(2)}`);
for (const name of ['continuum', 'still', 'balance']) {
  const model = await readFile(`dist/models/${name}.glb`);
  assert.equal(model.readUInt32LE(0), 0x46546c67);
  assert.equal(model.readUInt32LE(8), model.length);
}
const sources = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = `${dir}/${entry.name}`; if (entry.isDirectory()) await walk(path); else sources.push(path); } }
await walk('src');
for (const path of sources) {
  const content = await readFile(path, 'utf8');
  assert(!/127\.0\.0\.1|localhost|\/api\/|XMLHttpRequest|\bfetch\s*\(/.test(content), `Server dependency: ${path}`);
}
for (const path of ['.nojekyll', 'vendor/draco/draco_decoder.wasm', 'vendor/basis/basis_transcoder.wasm', 'vendor/meshopt_decoder.js']) await stat(`dist/${path}`);
console.log('PASS: relative entry/assets, three built-in GLBs, bundled decoders, same-site CSP, no app API or localhost references.');
