'use strict';

const fs = require('fs');
const path = require('path');

class Store {
  constructor(dir, log = () => {}) {
    this.dir = dir;
    this.log = log;
    this.mem = new Map();
    this.inflight = new Map();
    fs.mkdirSync(dir, { recursive: true });
  }

  _file(key) { return path.join(this.dir, key.replace(/[^a-z0-9._-]/gi, '_') + '.json'); }

  _read(key) {
    if (this.mem.has(key)) return this.mem.get(key);
    try {
      const rec = JSON.parse(fs.readFileSync(this._file(key), 'utf8'));
      this.mem.set(key, rec);
      return rec;
    } catch (_) { return null; }
  }

  _write(key, rec) {
    this.mem.set(key, rec);
    const file = this._file(key);
    const tmp = file + '.tmp';
    try {
      fs.writeFileSync(tmp, JSON.stringify(rec));
      fs.renameSync(tmp, file);
    } catch (e) { this.log(`cache write failed for ${key}: ${e.message}`); }
  }

  peek(key) { return this._read(key); }

  async get(key, ttlMs, loader, { force = false } = {}) {
    const cached = this._read(key);
    if (!force && cached && Date.now() - cached.fetchedAt < ttlMs) return { ...cached, stale: false, error: null };
    if (!this.inflight.has(key)) {
      const p = (async () => {
        try {
          const value = await loader();
          const rec = { value, fetchedAt: Date.now() };
          this._write(key, rec);
          return { ...rec, stale: false, error: null };
        } finally {
          this.inflight.delete(key);
        }
      })();
      this.inflight.set(key, p);
    }
    try {
      return await this.inflight.get(key);
    } catch (e) {
      this.log(`refresh of ${key} failed: ${e.message}`);
      if (cached) return { ...cached, stale: true, error: e.message };
      throw e;
    }
  }
}

module.exports = { Store };
