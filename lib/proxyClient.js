'use strict';

const { EduPageClient } = require('./edupage');

class ProxyEduPageClient extends EduPageClient {
  constructor({ proxyBase = '', timeoutMs = 25000, log } = {}) {
    super({ base: proxyBase.replace(/\/$/, '') + '/ep', timeoutMs, log });
    this.proxyBase = proxyBase.replace(/\/$/, '');
  }

  async call(path, args) {
    await this.session();
    const sep = path.includes('?') ? '&' : '?';
    const res = await this._fetch(this.base + path + sep + 'args=' + encodeURIComponent(JSON.stringify(args)));
    const text = await res.text();
    try { return JSON.parse(text); } catch (_) { throw new Error(`Pośrednik zwrócił nie-JSON dla ${path}`); }
  }

  async session(force = false) {
    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;
    const res = await fetch(this.proxyBase + '/ep/session' + (force ? '?refresh=1' : ''), { cache: force ? 'no-store' : 'default' });
    let j = {};
    try { j = await res.json(); } catch (_) { j = {}; }
    if (!res.ok) {
      const e = new Error(j.error || `Serwer odpowiedział ${res.status}`);
      e.code = j.code || null;
      throw e;
    }
    this.edupage = j.edupage || null;
    this._session = { cookie: '', gsh: 'proxy', year: Number(j.year) || new Date().getFullYear(), school: j.school || null, at: Date.now() };
    return this._session;
  }
}

module.exports = { ProxyEduPageClient };
