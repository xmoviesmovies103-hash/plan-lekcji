const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
require('./build-browser-lib.js');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const files = ['index.html', 'style.css', 'core.js', 'plan-lib.js', 'app.js', 'sw.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const STATIC = {};
for (const f of files) {
  const ext = path.extname(f);
  const buf = fs.readFileSync(path.join(root, 'public', f));
  if (ext === '.png') { STATIC['/' + f] = { type: TYPES[ext], b64: true, body: buf.toString('base64') }; continue; }
  let body = buf.toString('utf8');
  if (f === 'index.html') body = body.replace("window.PLAN_CONFIG = window.PLAN_CONFIG || { apiBase: '' };", "window.PLAN_CONFIG = { mode: 'proxy' };");
  STATIC['/' + f] = { type: TYPES[ext], body };
}
if (!STATIC['/index.html'].body.includes("mode: 'proxy'")) throw new Error('could not set proxy mode in index.html');

let lib = 'const LIB = (function () {\n  var defs = {};\n';
for (const m of ['html', 'substitutions', 'edupage']) {
  lib += `  defs['./${m}'] = function (module, exports, require) {\n${fs.readFileSync(path.join(root, 'lib', m + '.js'), 'utf8')}\n};\n`;
}
lib += `  var cache = {};
  function req(n) { var k = './' + n.replace(/^\\.\\//, ''); if (cache[k]) return cache[k].exports; var m = { exports: {} }; cache[k] = m; defs[k](m, m.exports, req); return m.exports; }
  var s = req('./substitutions'); var e = req('./edupage');
  return { parseSubstitutions: s.parseSubstitutions, entriesForClass: s.entriesForClass, normalizeEdupage: e.normalizeEdupage, schoolNameFromHtml: e.schoolNameFromHtml, notConfigured: e.notConfigured };
})();`;
const src = fs.readFileSync(path.join(root, 'cloudflare', 'worker-src.js'), 'utf8');
const push = fs.readFileSync(path.join(root, 'cloudflare', 'push-src.js'), 'utf8');
const out = ['const STATIC = ' + JSON.stringify(STATIC) + ';', lib, push, src].join('\n\n');
fs.writeFileSync(path.join(root, 'cloudflare', 'worker.js'), out);
console.log('cloudflare/worker.js', (out.length / 1024).toFixed(0) + ' KB');
