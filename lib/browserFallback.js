'use strict';

function loadPlaywright() {
  try { return require('playwright'); } catch (_) { return null; }
}

function available() { return !!loadPlaywright(); }

async function renderTimetable(base, className, { timeoutMs = 45000 } = {}) {
  const pw = loadPlaywright();
  if (!pw) throw new Error('Zapasowa metoda wymaga: npm install playwright && npx playwright install chromium');
  const browser = await pw.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'pl-PL' });
    let captured = null;
    page.on('response', async (r) => {
      if (/regularttGetData/i.test(r.url())) {
        try { captured = await r.json(); } catch (_) {}
      }
    });
    await page.goto(base + '/timetable/', { waitUntil: 'networkidle', timeout: timeoutMs });
    if (captured) return { raw: captured };

    const ok = await page.evaluate(async (wanted) => {
      const norm = (s) => String(s || '').toLowerCase().replace(/[\s -]+/g, '');
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const clickables = () => [...document.querySelectorAll('span,a,li,div,button')];
      const tab = clickables().find((el) => /oddzia|klasy|classes/i.test(el.getAttribute('title') || '') || /^oddzia[łl]y/i.test((el.textContent || '').trim()));
      if (tab) tab.click();
      const target = norm(wanted);
      const short = norm(String(wanted).split(/\s+/)[0]);
      for (let i = 0; i < 60; i++) {
        const link = [...document.querySelectorAll('a,li,span,div')].find((el) => el.children.length === 0 && (norm(el.textContent) === target || norm(el.textContent) === short));
        if (link) { link.click(); return true; }
        await sleep(100);
      }
      return false;
    }, className);
    if (!ok) throw new Error(`Nie znaleziono klasy „${className}” na stronie EduPage`);
    await page.waitForFunction(() => document.querySelectorAll('svg rect title').length > 3, null, { timeout: timeoutMs });
    if (captured) return { raw: captured };
    const svg = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      svgs.sort((a, b) => b.querySelectorAll('rect title').length - a.querySelectorAll('rect title').length);
      return svgs[0] ? svgs[0].outerHTML : '';
    });
    return { svg };
  } finally {
    await browser.close();
  }
}

module.exports = { available, renderTimetable };
