'use strict';

const USER_AGENT = 'Mozilla/5.0 (PlanLekcji) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

function normalizeEdupage(input) {
  let s = String(input || '').trim().toLowerCase();
  s = s.replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  s = s.replace(/\.edupage\.org$/, '');
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(s) ? s : null;
}

function schoolNameFromHtml(html) {
  const m = /"school_name"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(html || '');
  let name = null;
  if (m) { try { name = JSON.parse(m[1]); } catch (_) { name = null; } }
  if (!name) {
    const t = /<title>([^<]*)<\/title>/i.exec(html || '');
    if (t && t[1].includes('|')) name = t[1].split('|').slice(1).join('|');
  }
  if (!name) return null;
  name = name.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  name = name.split(/,\s*(?:ul\.|ulica|al\.|aleja|os\.|pl\.)\s/i)[0].trim();
  return name || null;
}

function notConfigured() {
  const e = new Error('Nie ustawiono adresu EduPage szkoły.');
  e.code = 'NOT_CONFIGURED';
  return e;
}

function warsawToday(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(date);
}

function schoolYear(dateStr = warsawToday()) {
  const [y, m] = dateStr.split('-').map(Number);
  return m >= 8 ? y : y - 1;
}

class EduPageClient {
  constructor({ subdomain = null, base = null, timeoutMs = 20000, log = () => {} } = {}) {
    this.edupage = normalizeEdupage(subdomain);
    this.base = base || (this.edupage ? `https://${this.edupage}.edupage.org` : null);
    this.timeoutMs = timeoutMs;
    this.log = log;
    this._session = null;
  }

  async _fetch(url, opts = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: ctrl.signal,
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pl,en;q=0.8', ...(opts.headers || {}) },
      });
      if (!res.ok) throw new Error(`EduPage odpowiedział ${res.status} dla ${url.replace(this.base, '')}`);
      return res;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(`Przekroczono czas oczekiwania na EduPage (${url.replace(this.base, '')})`);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  async session(force = false) {
    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;
    if (!this.base) throw notConfigured();
    const res = await this._fetch(this.base + '/timetable/');
    const html = await res.text();
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    const cookie = setCookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
    const gsh = (/gsechash\s*=\s*["']([0-9a-fA-F]+)["']/.exec(html) || [])[1] || '00000000';
    const year = Number((/"year_auto"\s*:\s*(\d{4})/.exec(html) || [])[1]) || schoolYear();
    if (!/ASC\.|edupage/i.test(html)) throw new Error('Pod tym adresem nie ma strony EduPage.');
    this._session = { cookie, gsh, year, school: schoolNameFromHtml(html), at: Date.now() };
    return this._session;
  }

  async call(path, args, { retry = true } = {}) {
    const s = await this.session();
    try {
      const res = await this._fetch(this.base + path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Accept: 'application/json, text/javascript, */*',
          Referer: this.base + '/timetable/',
          'X-Requested-With': 'XMLHttpRequest',
          ...(s.cookie ? { Cookie: s.cookie } : {}),
        },
        body: JSON.stringify({ __args: args, __gsh: s.gsh }),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { throw new Error(`EduPage zwrócił nie-JSON dla ${path}`); }
      if (json && json.r === undefined && json.err) throw new Error(`EduPage: ${JSON.stringify(json.err).slice(0, 200)}`);
      return json;
    } catch (e) {
      if (!retry) throw e;
      this.log(`retrying ${path} with a fresh session: ${e.message}`);
      await this.session(true);
      return this.call(path, args, { retry: false });
    }
  }

  async currentTimetable(today = warsawToday()) {
    const s = await this.session();
    const v = await this.call('/timetable/server/ttviewer.js?__func=getTTViewerData', [null, s.year]);
    const reg = (v && v.r && v.r.regular) || {};
    const list = Array.isArray(reg.timetables) ? reg.timetables : [];
    const visible = list.filter((t) => !t.hidden);
    const started = visible.filter((t) => !t.datefrom || t.datefrom <= today).sort((a, b) => String(b.datefrom).localeCompare(String(a.datefrom)));
    const pick = started[0] || visible.find((t) => String(t.tt_num) === String(reg.default_num)) || visible[0] || list.find((t) => String(t.tt_num) === String(reg.default_num));
    const ttNum = pick ? String(pick.tt_num) : reg.default_num ? String(reg.default_num) : null;
    if (!ttNum) throw new Error('EduPage nie podał żadnego opublikowanego planu');
    return { ttNum, name: pick ? pick.text : null, validFrom: pick ? pick.datefrom : null, year: s.year };
  }

  async regularTimetable(ttNum) {
    return this.call('/timetable/server/regulartt.js?__func=regularttGetData', [null, String(ttNum)]);
  }

  async dictionary() {
    const s = await this.session();
    return this.call('/rpr/server/maindbi.js?__func=mainDBIAccessor', [null, s.year, {}, {
      op: 'fetch',
      needed_part: { teachers: ['short', 'name', 'firstname', 'lastname'], subjects: ['short', 'name'], classes: ['short', 'name'], classrooms: ['short', 'name'] },
      needed_combos: {},
    }]);
  }

  async substitutionHtml(date) {
    const errors = [];
    try {
      const j = await this.call('/substitution/server/viewer.js?__func=getSubstViewerDayDataHtml', [null, { date, mode: 'classes' }]);
      if (j && typeof j.r === 'string') return { html: j.r, via: 'api' };
      errors.push('API zastępstw zwróciło nieoczekiwany format');
    } catch (e) { errors.push(e.message); }

    try {
      const res = await this._fetch(`${this.base}/substitution/?date=${encodeURIComponent(date)}`);
      const html = await res.text();
      const dm = /data-date\\?["']?\s*[:=]\s*\\?["'](\d{4}-\d{2}-\d{2})/.exec(html) || /"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/.exec(html);
      if (dm && dm[1] !== date) throw new Error(`strona zastępstw pokazała ${dm[1]} zamiast ${date}`);
      return { html, via: 'page' };
    } catch (e) { errors.push(e.message); }
    throw new Error('Nie udało się pobrać zastępstw: ' + errors.join(' / '));
  }
}

module.exports = { EduPageClient, warsawToday, schoolYear, normalizeEdupage, schoolNameFromHtml, notConfigured };
