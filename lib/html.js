'use strict';

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
  rarr: '→', larr: '←', hellip: '…', oacute: 'ó', Oacute: 'Ó',
};

function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, e) ? ENTITIES[e] : m;
  });
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

const BLOCK = new Set([
  'div', 'p', 'li', 'ul', 'ol', 'tr', 'td', 'th', 'table', 'tbody', 'thead', 'section', 'header', 'footer',
  'article', 'main', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'dd', 'dt', 'dl', 'caption',
]);
const SKIP_CONTENT = new Set(['script', 'style', 'noscript', 'template']);

function htmlToLines(html) {
  const lines = [];
  let buf = '';
  const stack = [];
  const flush = () => {
    const text = decodeEntities(buf).replace(/\s+/g, ' ').trim();
    if (text) {
      const hints = stack.map((s) => s.cls).filter(Boolean).join(' ').split(/\s+/).filter(Boolean);
      lines.push({ text, hints, depth: stack.length });
    }
    buf = '';
  };
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*?)(\/?)>|([^<]+)|</g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { buf += m[5]; continue; }
    if (!m[2]) { if (m[0] === '<') buf += '<'; continue; }
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClose = m[4] === '/' || tag === 'br' || tag === 'img' || tag === 'hr' || tag === 'input' || tag === 'meta' || tag === 'link';
    if (!closing && SKIP_CONTENT.has(tag)) {
      const end = html.toLowerCase().indexOf('</' + tag, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : end;
      continue;
    }
    if (BLOCK.has(tag)) flush();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
    } else if (!selfClose) {
      const cls = BLOCK.has(tag) ? (parseAttrs(m[3]).class || '') : '';
      if (BLOCK.has(tag)) stack.push({ tag, cls });
    }
  }
  flush();
  return lines;
}

module.exports = { decodeEntities, parseAttrs, htmlToLines };
