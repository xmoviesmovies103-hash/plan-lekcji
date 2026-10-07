const STATIC = {"/index.html":{"type":"text/html; charset=utf-8","body":"<!doctype html>\n<html lang=\"pl\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n  <title>Plan lekcji</title>\n  <meta name=\"description\" content=\"Plan lekcji i zastępstwa z EduPage w czytelnej formie\">\n  <meta name=\"theme-color\" content=\"#1f3b63\">\n  <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n  <meta name=\"mobile-web-app-capable\" content=\"yes\">\n  <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n  <meta name=\"apple-mobile-web-app-title\" content=\"Plan lekcji\">\n  <link rel=\"apple-touch-icon\" href=\"icon-180.png\">\n  <link rel=\"icon\" href=\"icon-192.png\" type=\"image/png\">\n  <link rel=\"manifest\" href=\"manifest.webmanifest\">\n  <link rel=\"stylesheet\" href=\"style.css\">\n  <script>window.PLAN_CONFIG = { mode: 'proxy' };</script>\n</head>\n<body>\n  <header class=\"site-head\">\n    <div class=\"wrap head-in\">\n      <div class=\"school\">\n        <span class=\"school-name\" id=\"schoolName\" hidden></span>\n        <span class=\"site-name\">Plan lekcji</span>\n      </div>\n      <nav class=\"head-nav\" id=\"headNav\" hidden>\n        <button class=\"head-link\" id=\"classBtn\" type=\"button\"></button>\n        <button class=\"head-link\" id=\"settingsBtn\" type=\"button\">Ustawienia</button>\n      </nav>\n    </div>\n  </header>\n\n  <div class=\"wrap\" id=\"app\" hidden>\n    <div id=\"demoBar\"></div>\n\n    <section class=\"now\" id=\"now\" aria-live=\"polite\"></section>\n    <div id=\"pushCard\"></div>\n    <div id=\"banner\"></div>\n\n    <div class=\"days\">\n      <button class=\"week-nav\" id=\"prevWeek\" type=\"button\" aria-label=\"Poprzedni tydzień\">‹</button>\n      <div class=\"day-tabs\" id=\"dayTabs\" role=\"tablist\" aria-label=\"Dni tygodnia\"></div>\n      <button class=\"week-nav\" id=\"nextWeek\" type=\"button\" aria-label=\"Następny tydzień\">›</button>\n    </div>\n\n    <div class=\"plan-head\">\n      <h1 class=\"day-title\" id=\"dayTitle\"></h1>\n      <div class=\"switch\" role=\"group\" aria-label=\"Widok\">\n        <button type=\"button\" data-view=\"day\" class=\"switch-btn\">Dzień</button>\n        <button type=\"button\" data-view=\"week\" class=\"switch-btn\">Tydzień</button>\n      </div>\n    </div>\n\n    <div id=\"groupPrompt\"></div>\n    <section id=\"plan\" class=\"plan\"></section>\n\n    <div id=\"installHint\" class=\"install-slot\"></div>\n    <footer class=\"foot\" id=\"foot\"></footer>\n  </div>\n\n  <div class=\"wrap picker\" id=\"picker\" hidden>\n    <p class=\"picker-school\" id=\"pickerSchool\" hidden></p>\n    <h1>Do której klasy chodzisz?</h1>\n    <p class=\"picker-sub\">Wybór zostanie zapamiętany na tym urządzeniu. Zmienisz go później w ustawieniach.</p>\n    <label class=\"search\" for=\"classSearch\">Szukaj klasy</label>\n    <input id=\"classSearch\" type=\"search\" placeholder=\"np. 1A\" autocomplete=\"off\">\n    <div id=\"classList\" class=\"class-list\"></div>\n    <button class=\"btn\" id=\"pickerCancel\" type=\"button\" hidden>Wróć do planu</button>\n  </div>\n\n  <div class=\"wrap picker\" id=\"setup\" hidden>\n    <h1>Ustaw szkołę</h1>\n    <p class=\"picker-sub\" id=\"setupLead\"></p>\n    <label class=\"search\" for=\"setupInput\">Adres EduPage szkoły</label>\n    <input id=\"setupInput\" class=\"text-input\" type=\"text\" inputmode=\"url\" placeholder=\"mojaszkola.edupage.org\" autocomplete=\"off\" autocapitalize=\"off\" spellcheck=\"false\">\n    <p class=\"hint setup-hint\">Adres znajdziesz na stronie szkoły albo w aplikacji EduPage. Ma postać <b>nazwa.edupage.org</b>.</p>\n    <div class=\"btns\">\n      <button class=\"btn primary\" id=\"setupSave\" type=\"button\" data-act=\"setup-save\">Zapisz i sprawdź</button>\n      <button class=\"btn\" id=\"setupCancel\" type=\"button\" data-act=\"setup-cancel\" hidden>Anuluj</button>\n    </div>\n    <div id=\"setupHelp\" class=\"setup-help\"></div>\n  </div>\n\n  <dialog class=\"dlg\" id=\"detail\" aria-labelledby=\"detailTitle\"></dialog>\n  <dialog class=\"dlg\" id=\"settings\" aria-labelledby=\"settingsTitle\"></dialog>\n  <div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\"></div>\n\n  <script src=\"core.js\"></script>\n  <script src=\"plan-lib.js\"></script>\n  <script src=\"app.js\"></script>\n</body>\n</html>\n"},"/style.css":{"type":"text/css; charset=utf-8","body":":root {\n  --page: #eef1f4;\n  --panel: #ffffff;\n  --text: #1c232b;\n  --muted: #5a6470;\n  --soft: #8a929c;\n  --line: #d5dbe1;\n  --line-soft: #e6eaee;\n  --head: #1f3b63;\n  --head-text: #ffffff;\n  --link: #1f4f8f;\n  --tab: #f6f8fa;\n\n  --now: #1d7a44;\n  --now-bg: #e5f3ea;\n  --chg: #9a5800;\n  --chg-bg: #fdf1dc;\n  --off: #b3261e;\n  --off-bg: #fbe9e7;\n  --add: #1f4f8f;\n  --add-bg: #e7eef8;\n\n  --r: 4px;\n  --font: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  color-scheme: light;\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) {\n    --page: #15191e; --panel: #1d232a; --text: #e6e9ed; --muted: #a2abb5; --soft: #7d8692;\n    --line: #333c46; --line-soft: #2a3139; --head: #182c48; --head-text: #ffffff; --link: #8db4ec; --tab: #232a32;\n    --now: #6fd197; --now-bg: #173323; --chg: #f2b55c; --chg-bg: #382a12; --off: #f19288; --off-bg: #3b1f1c;\n    --add: #8db4ec; --add-bg: #1e2b3d;\n    color-scheme: dark;\n  }\n}\n:root[data-theme=\"dark\"] {\n  --page: #15191e; --panel: #1d232a; --text: #e6e9ed; --muted: #a2abb5; --soft: #7d8692;\n  --line: #333c46; --line-soft: #2a3139; --head: #182c48; --head-text: #ffffff; --link: #8db4ec; --tab: #232a32;\n  --now: #6fd197; --now-bg: #173323; --chg: #f2b55c; --chg-bg: #382a12; --off: #f19288; --off-bg: #3b1f1c;\n  --add: #8db4ec; --add-bg: #1e2b3d;\n  color-scheme: dark;\n}\n\n* { box-sizing: border-box; }\nhtml { -webkit-text-size-adjust: 100%; }\nbody {\n  margin: 0; background: var(--page); color: var(--text);\n  font: 400 15px/1.5 var(--font); font-variant-numeric: tabular-nums;\n}\nbutton { font: inherit; color: inherit; }\n[hidden] { display: none !important; }\n.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }\na { color: var(--link); }\n\n.wrap { max-width: 980px; margin: 0 auto; padding-inline: 16px; }\n\n.site-head {\n  background: var(--head); color: var(--head-text);\n  padding-top: env(safe-area-inset-top, 0px);\n}\n.head-in { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 60px; }\n.school { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }\n.school-name { font-size: 12.5px; opacity: .8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.site-name { font-size: 18px; font-weight: 600; }\n.head-nav { display: flex; gap: 4px; flex: none; }\n.head-link {\n  background: transparent; border: 1px solid rgba(255, 255, 255, .35); color: var(--head-text);\n  border-radius: var(--r); padding: 6px 10px; cursor: pointer; font-size: 14px; white-space: nowrap;\n}\n.head-link:hover { background: rgba(255, 255, 255, .12); }\n.head-link b { font-weight: 600; }\n\n#app { padding-block: 16px 32px; }\n\n.now {\n  background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--line);\n  border-radius: var(--r); padding: 14px 16px; margin-bottom: 16px;\n}\n.now.is-lesson { border-left-color: var(--now); }\n.now.is-break { border-left-color: var(--link); }\n.now-date { font-size: 13px; color: var(--muted); margin: 0 0 4px; }\n.now-title { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 600; }\n.now.is-lesson .now-title .lbl { color: var(--now); }\n.now-sub { margin: 4px 0 0; font-size: 15px; }\n.now-sub .chg { color: var(--chg); font-weight: 600; }\n.progress { margin-top: 10px; }\n.bar { height: 6px; background: var(--line-soft); border-radius: 3px; overflow: hidden; }\n.bar > span { display: block; height: 100%; background: var(--now); }\n.progress-text { display: flex; justify-content: space-between; gap: 10px; font-size: 13px; color: var(--muted); margin-top: 4px; }\n.now-next { margin: 10px 0 0; padding-top: 10px; border-top: 1px solid var(--line-soft); font-size: 14px; color: var(--muted); }\n.now-next b { color: var(--text); font-weight: 600; }\n\n.notice {\n  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px;\n  border: 1px solid var(--line); border-left: 4px solid var(--chg); background: var(--panel);\n  border-radius: var(--r); padding: 10px 14px; margin-bottom: 16px; font-size: 14px;\n}\n.notice.info { border-left-color: var(--link); }\n.notice.bad { border-left-color: var(--off); }\n.notice p { margin: 0; flex: 1 1 260px; }\n.push-card { align-items: flex-end; }\n.push-text { flex: 1 1 320px; display: grid; gap: 6px; }\n.push-text b { font-size: 15px; }\n.notice .hint, .field p.hint { font-size: 13px; color: var(--muted); }\n.field .btns { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }\n.field p { margin: 6px 0; }\n.notice .btns { display: flex; flex-wrap: wrap; gap: 6px; }\n\n.days { display: flex; align-items: stretch; gap: 0; border-bottom: 1px solid var(--line); }\n.week-nav {\n  flex: none; width: 36px; border: 0; background: transparent; font-size: 22px; line-height: 1;\n  color: var(--muted); cursor: pointer; padding: 0 0 4px;\n}\n.week-nav:hover { color: var(--text); }\n.day-tabs { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); }\n.day-tab {\n  border: 1px solid transparent; border-bottom: 0; background: transparent; cursor: pointer;\n  padding: 8px 4px 7px; margin-bottom: -1px; border-radius: var(--r) var(--r) 0 0;\n  text-align: center; color: var(--muted); line-height: 1.3; min-width: 0;\n}\n.day-tab .d { display: block; font-weight: 600; font-size: 15px; color: var(--text); }\n.day-tab:not(.today) .d { color: var(--muted); font-weight: 500; }\n.day-tab .n { display: block; font-size: 12.5px; }\n.day-tab .tag { display: block; font-size: 11.5px; font-weight: 600; min-height: 1.3em; }\n.day-tab .tag.today-tag { color: var(--now); }\n.day-tab .tag.chg-tag { color: var(--chg); }\n.day-tab:hover { background: var(--tab); }\n.day-tab[aria-selected=\"true\"] { background: var(--panel); border-color: var(--line); color: var(--text); }\n\n.plan-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 16px 0 10px; flex-wrap: wrap; }\n.day-title { margin: 0; font-size: 18px; font-weight: 600; }\n.day-title .date { font-weight: 400; color: var(--muted); margin-left: 6px; font-size: 15px; }\n.switch { display: inline-flex; border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; background: var(--panel); }\n.switch-btn { border: 0; background: transparent; padding: 5px 14px; cursor: pointer; font-size: 14px; color: var(--muted); }\n.switch-btn + .switch-btn { border-left: 1px solid var(--line); }\n.switch-btn[aria-pressed=\"true\"] { background: var(--head); color: var(--head-text); }\n\n.plan { background: var(--panel); border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; }\ntable.day { width: 100%; border-collapse: collapse; }\ntable.day th {\n  text-align: left; font-size: 13px; font-weight: 600; color: var(--muted); background: var(--tab);\n  padding: 8px 10px; border-bottom: 1px solid var(--line);\n}\ntable.day td { padding: 10px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }\ntable.day tbody tr:last-child td { border-bottom: 0; }\n.c-num { width: 40px; text-align: center; font-weight: 600; color: var(--muted); }\n.c-time { width: 112px; white-space: nowrap; }\n.c-time .sep { color: var(--soft); margin: 0 2px; }\n.c-time .mnum { display: none; }\n.c-subj .subj { font-weight: 600; }\n.c-subj .note { display: block; font-size: 13px; color: var(--muted); margin-top: 2px; }\n.c-room { width: 104px; white-space: nowrap; }\n.c-room .room-lbl { display: none; }\n.c-info { width: 130px; }\n.c-more { width: 44px; text-align: right; }\n.grp { font-size: 12.5px; color: var(--muted); margin-left: 6px; white-space: nowrap; }\n.label {\n  display: inline-block; font-size: 12px; font-weight: 600; padding: 1px 6px; border-radius: 3px;\n  background: var(--chg-bg); color: var(--chg); white-space: nowrap; margin: 0 4px 2px 0;\n}\n.label.cancel { background: var(--off-bg); color: var(--off); }\n.label.added { background: var(--add-bg); color: var(--add); }\n.label.absent { background: var(--line-soft); color: var(--muted); }\n.label.live { background: var(--now); color: var(--panel); }\ns { color: var(--soft); }\n.to { font-weight: 600; color: var(--chg); }\n.arrow { color: var(--soft); margin: 0 3px; }\n.info-btn {\n  width: 28px; height: 28px; border: 1px solid var(--line); border-radius: var(--r); background: var(--panel);\n  color: var(--muted); font-weight: 600; font-size: 14px; cursor: pointer; line-height: 1;\n}\n.info-btn:hover { border-color: var(--link); color: var(--link); }\n\ntr.lesson.has-next td { border-bottom-style: dotted; }\ntr.lesson.is-now td { background: var(--now-bg); }\ntr.lesson.is-now td.c-num { color: var(--now); box-shadow: inset 4px 0 0 var(--now); }\ntr.lesson.st-cancelled .subj, tr.lesson.st-cancelled .c-teacher, tr.lesson.st-cancelled .c-room,\ntr.lesson.st-absent .subj { text-decoration: line-through; color: var(--soft); }\ntr.lesson.st-cancelled td { background: var(--off-bg); }\ntr.lesson.is-past:not(.is-now) td { color: var(--soft); }\ntr.gap td { padding: 4px 10px; font-size: 13px; color: var(--soft); background: var(--tab); }\ntr.gap .gap-in { display: flex; gap: 12px; }\ntr.gap .gap-time { width: 112px; margin-left: 50px; }\ntr.gap.free td { color: var(--muted); }\ntr.gap.is-now td { background: var(--add-bg); color: var(--add); font-weight: 600; }\n.empty { padding: 32px 20px; text-align: center; color: var(--muted); }\n.empty strong { display: block; color: var(--text); font-size: 16px; margin-bottom: 4px; }\n\n.week-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }\ntable.week { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 700px; table-layout: fixed; }\ntable.week th, table.week td { border-right: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); padding: 5px; vertical-align: top; }\ntable.week tr > :last-child { border-right: 0; }\ntable.week tbody tr:last-child > * { border-bottom: 0; }\ntable.week thead th { background: var(--tab); font-size: 13px; font-weight: 600; color: var(--muted); text-align: left; padding: 7px 8px; }\ntable.week thead th.today { color: var(--text); background: var(--panel); box-shadow: inset 0 -3px 0 var(--head); }\ntable.week th.pcol { width: 64px; position: sticky; left: 0; background: var(--tab); z-index: 1; font-size: 12.5px; font-weight: 400; color: var(--muted); }\ntable.week th.pcol b { display: block; color: var(--text); }\ntable.week td.other { background: var(--tab); }\ntable.week td.other .wcell { opacity: .55; filter: grayscale(1); }\n.wcell {\n  display: block; width: 100%; text-align: left; border: 1px solid var(--line-soft); border-radius: 3px;\n  background: var(--panel); padding: 4px 6px; margin-bottom: 4px; cursor: pointer; line-height: 1.3;\n}\n.wcell:last-child { margin-bottom: 0; }\n.wcell b { display: block; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.wcell span { font-size: 12px; color: var(--muted); }\n.wcell.st-changed { background: var(--chg-bg); border-color: transparent; }\n.wcell.st-added { background: var(--add-bg); border-color: transparent; }\n.wcell.st-cancelled, .wcell.st-absent { background: var(--off-bg); border-color: transparent; }\n.wcell.st-cancelled b, .wcell.st-absent b { text-decoration: line-through; color: var(--off); }\n.wcell.is-now { background: var(--now); border-color: var(--now); }\n.wcell.is-now b, .wcell.is-now span { color: var(--panel); }\n\n.btn {\n  border: 1px solid var(--line); background: var(--panel); border-radius: var(--r);\n  padding: 6px 12px; font-size: 14px; cursor: pointer;\n}\n.btn:hover { border-color: var(--link); color: var(--link); }\n.btn.primary { background: var(--head); border-color: var(--head); color: var(--head-text); }\n.link-btn { border: 0; background: none; color: var(--link); cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 2px; font-size: inherit; }\n\n.install-slot .notice { margin: 16px 0 0; }\n.foot { margin-top: 16px; font-size: 13px; color: var(--muted); display: flex; flex-wrap: wrap; gap: 4px 16px; }\n.foot .warn { color: var(--chg); }\n\n.picker { padding-block: 24px 40px; }\n.picker h1 { font-size: 24px; line-height: 1.25; margin: 0 0 6px; font-weight: 600; }\n.picker-sub { color: var(--muted); margin: 0 0 18px; }\n.search { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; }\n#classSearch, .text-input {\n  width: 100%; max-width: 420px; height: 42px; border: 1px solid var(--line); border-radius: var(--r);\n  background: var(--panel); color: var(--text); padding: 0 12px; font: inherit; font-size: 16px;\n}\n.class-list { margin: 18px 0; }\n.class-group { margin-bottom: 18px; }\n.class-group h2 { font-size: 14px; font-weight: 600; color: var(--muted); margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--line); }\n.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 6px; }\n.class-opt {\n  text-align: left; border: 1px solid var(--line); background: var(--panel); border-radius: var(--r);\n  padding: 8px 10px; cursor: pointer; line-height: 1.25;\n}\n.class-opt b { display: block; font-size: 15px; }\n.class-opt span { font-size: 12.5px; color: var(--muted); }\n.class-opt:hover { border-color: var(--link); }\n.class-opt.current { border-color: var(--head); box-shadow: inset 0 0 0 1px var(--head); }\n.picker .msg { color: var(--muted); }\n\ndialog.dlg {\n  border: 1px solid var(--line); padding: 0; border-radius: 6px; width: min(460px, calc(100vw - 24px));\n  background: var(--panel); color: var(--text); box-shadow: 0 10px 30px rgba(0, 0, 0, .25);\n}\ndialog.dlg::backdrop { background: rgba(10, 18, 28, .45); }\n.dlg-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line-soft); }\n.dlg-head h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.3; }\n.dlg-head .sub { display: block; font-size: 13px; color: var(--muted); font-weight: 400; }\n.close-btn { flex: none; border: 1px solid var(--line); background: var(--panel); border-radius: var(--r); padding: 4px 10px; cursor: pointer; font-size: 14px; }\n.dlg-body { padding: 8px 16px 16px; }\ndl.facts { display: grid; grid-template-columns: 110px 1fr; gap: 6px 12px; margin: 8px 0 0; }\ndl.facts dt { color: var(--muted); }\ndl.facts dd { margin: 0; }\n.raw { margin-top: 14px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--line-soft); padding-top: 10px; }\n.field { margin: 14px 0; }\n.field > label, .field > .lbl { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; }\n.field select { width: 100%; height: 40px; border: 1px solid var(--line); border-radius: var(--r); background: var(--panel); color: var(--text); font: inherit; padding: 0 8px; }\n.field .hint { font-size: 13px; color: var(--muted); }\n.row-between { display: flex; justify-content: space-between; align-items: center; gap: 10px; }\n.check-out { white-space: pre-wrap; font: 13px/1.5 var(--font); background: var(--tab); border: 1px solid var(--line-soft); border-radius: var(--r); padding: 8px 10px; margin: 8px 0 0; }\n.steps { margin: 6px 0 0; padding-left: 20px; }\n.steps li { margin: 2px 0; }\n\n.toast {\n  position: fixed; left: 50%; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);\n  background: var(--text); color: var(--panel); padding: 8px 14px; border-radius: var(--r); font-size: 14px;\n  opacity: 0; pointer-events: none; transition: opacity .2s; max-width: calc(100vw - 32px); z-index: 50;\n}\n.toast.show { opacity: 1; }\n@media (prefers-reduced-motion: reduce) { .toast { transition: none; } }\n\n.demo-bar { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; font-size: 13px; color: var(--muted); margin-bottom: 12px; }\n.demo-bar select { font: inherit; border: 1px solid var(--line); border-radius: var(--r); background: var(--panel); color: var(--text); padding: 2px 6px; }\n\n@media (max-width: 700px) {\n  .school-name { font-size: 12px; }\n  .site-name { font-size: 17px; }\n  .head-link { padding: 5px 8px; font-size: 13.5px; }\n  .head-link .cls-lbl { display: none; }\n  .now-title { font-size: 20px; }\n  .week-nav { width: 26px; }\n  .day-tab { padding: 7px 0 6px; }\n  .day-tab .n { font-size: 12px; }\n  .day-tab .tag { font-size: 11px; }\n\n  table.day thead { display: none; }\n  table.day, table.day tbody { display: block; }\n  tr.lesson { display: grid; grid-template-columns: 58px 1fr 34px; column-gap: 10px; padding: 10px; border-bottom: 1px solid var(--line-soft); }\n  table.day tr.lesson td { padding: 0; border: 0; background: none; }\n  tr.lesson td.c-num { display: none; }\n  tr.lesson td.c-time { grid-column: 1; grid-row: 1 / span 4; width: auto; display: flex; flex-direction: column; font-size: 14px; }\n  tr.lesson td.c-time .t1 { font-weight: 600; }\n  tr.lesson td.c-time .sep { display: none; }\n  tr.lesson td.c-time .mnum { display: block; font-size: 12px; color: var(--soft); }\n  tr.lesson td.c-subj { grid-column: 2; grid-row: 1; }\n  tr.lesson td.c-teacher { grid-column: 2; grid-row: 2; font-size: 14px; color: var(--muted); }\n  tr.lesson td.c-room { grid-column: 2; grid-row: 3; font-size: 14px; color: var(--muted); width: auto; }\n  tr.lesson td.c-room .room-lbl { display: inline; }\n  tr.lesson td.c-room:empty, tr.lesson td.c-info:empty { display: none; }\n  tr.lesson td.c-info { grid-column: 2; grid-row: 4; width: auto; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }\n  tr.lesson td.c-info .label { margin: 0; }\n  tr.lesson td.c-more { grid-column: 3; grid-row: 1 / span 4; width: auto; }\n  tr.lesson.is-now { background: var(--now-bg); box-shadow: inset 4px 0 0 var(--now); }\n  tr.lesson.st-cancelled { background: var(--off-bg); }\n  tr.lesson.has-next { border-bottom-style: dotted; }\n  tr.lesson.same-slot td.c-time { visibility: hidden; }\n  tr.gap { display: block; }\n  tr.gap td { display: block; padding: 4px 10px 4px 78px; border: 0; border-bottom: 1px solid var(--line-soft); }\n  tr.gap .gap-time { width: auto; margin-left: 0; }\n  dl.facts { grid-template-columns: 96px 1fr; }\n}\n\n.picker-school { margin: 0 0 4px; color: var(--muted); font-size: 14px; }\n.setup-hint { font-size: 13px; color: var(--muted); margin: 6px 0 14px; }\n.picker .btns { display: flex; flex-wrap: wrap; gap: 8px; }\n.setup-help { margin-top: 16px; max-width: 640px; }\n.setup-help .steps { margin-top: 8px; }\n"},"/core.js":{"type":"text/javascript; charset=utf-8","body":"(function (root, factory) {\n  if (typeof module === 'object' && module.exports) module.exports = factory();\n  else root.PlanCore = factory();\n}(typeof self !== 'undefined' ? self : this, function () {\n  'use strict';\n\n  const DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];\n  const DAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];\n\n  function toMin(hhmm) {\n    const m = /^(\\d{1,2}):(\\d{2})/.exec(hhmm || '');\n    return m ? Number(m[1]) * 60 + Number(m[2]) : null;\n  }\n  function fmtMin(min) {\n    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');\n  }\n  function isoDate(d) {\n    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');\n  }\n  function parseIso(s) {\n    const [y, m, d] = s.split('-').map(Number);\n    return new Date(y, m - 1, d, 12, 0, 0);\n  }\n\n  function weekdayIndex(date) { return (date.getDay() + 6) % 7; }\n\n  function weekDates(date, offset) {\n    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);\n    d.setDate(d.getDate() - weekdayIndex(d) + 7 * (offset || 0));\n    const out = [];\n    for (let i = 0; i < 5; i++) { out.push(isoDate(d)); d.setDate(d.getDate() + 1); }\n    return out;\n  }\n\n  function normGroup(g) {\n    return String(g || '').toLowerCase().replace(/^(grupa|gr\\.?|g)\\s*(?=\\d)/, '').trim();\n  }\n  function normName(n) {\n    return String(n || '').toLowerCase().split(/\\s+/).filter(Boolean).sort().join(' ');\n  }\n  function sameSubject(a, b) {\n    if (!a || !b) return false;\n    const n = (s) => String(s || '').toLowerCase().trim();\n    return (a.name && b.name && n(a.name) === n(b.name)) || (a.short && b.short && n(a.short) === n(b.short));\n  }\n\n  function groupVisible(groups, divisions, prefs) {\n    if (!groups || !groups.length) return true;\n    const sel = (prefs && prefs.groups) || {};\n    return groups.some((g) => {\n      const div = (divisions || []).find((d) => d.groups.some((x) => normGroup(x) === normGroup(g)));\n      if (!div) return true;\n      const choice = sel[div.id];\n      if (!choice || choice === '*') return true;\n      if (choice === 'none') return false;\n      return normGroup(choice) === normGroup(g);\n    });\n  }\n\n  function clone(o) { return JSON.parse(JSON.stringify(o)); }\n\n  function periodRange(entry, periods) {\n    if (entry.allDay) return [periods[0] ? periods[0].n : 1, periods.length ? periods[periods.length - 1].n : 20];\n    let from = entry.periodFrom;\n    let to = entry.periodTo;\n    if (from == null && entry.start) {\n      const p = periods.find((x) => x.start === entry.start);\n      if (p) from = p.n;\n    }\n    if (to == null && entry.end) {\n      const p = periods.find((x) => x.end === entry.end);\n      if (p) to = p.n;\n    }\n    if (from == null) return null;\n    return [from, to == null ? from : to];\n  }\n\n  function teacherNames(list) { return (list || []).map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean); }\n\n  function mergeDay(tt, day, entries, prefs) {\n    const periods = tt.periods || [];\n    const byN = new Map(periods.map((p) => [p.n, p]));\n    const items = (tt.lessons || []).filter((l) => l.day === day).map((l) => ({\n      ...clone(l), teachers: teacherNames(l.teachers), status: 'normal', changes: {}, notes: [], sources: [],\n    }));\n\n    for (const e of entries || []) {\n      const range = periodRange(e, periods);\n      if (!range) continue;\n      const [from, to] = range;\n      let targets = items.filter((l) => l.status !== 'added' && l.from <= to && l.to >= from);\n      if (e.groups && e.groups.length) {\n        const eg = e.groups.map(normGroup);\n        targets = targets.filter((l) => !l.groups.length || l.groups.some((g) => eg.includes(normGroup(g))));\n      }\n      if (targets.length > 1) {\n        const subj = e.subjectFrom || e.subject;\n        const bySubj = targets.filter((l) => sameSubject(l.subject, subj));\n        if (bySubj.length) targets = bySubj;\n      }\n\n      if (e.absent) {\n        targets.forEach((l) => { l.status = 'absent'; l.notes.push(...(e.notes || [])); l.sources.push(e); });\n        continue;\n      }\n\n      if (!targets.length) {\n        const pf = byN.get(from); const pt = byN.get(to);\n        const subj = e.subject || e.subjectFrom || { name: null, short: '?' };\n        items.push({\n          id: `sub-${from}-${items.length}`,\n          day, from, to,\n          start: e.start || (pf && pf.start), end: e.end || (pt && pt.end),\n          subject: { name: subj.name || subj.short, short: subj.short },\n          teachers: e.teacherTo.length ? e.teacherTo.slice() : e.teachers.slice(),\n          rooms: [e.roomTo || e.room].filter(Boolean),\n          groups: (e.groups || []).slice(),\n          status: e.cancelled ? 'cancelled' : 'added',\n          changes: {}, notes: (e.notes || []).slice(), sources: [e],\n        });\n        continue;\n      }\n\n      for (const l of targets) {\n        l.sources.push(e);\n        l.notes.push(...(e.notes || []).filter((n) => !l.notes.includes(n)));\n        if (e.cancelled) { l.status = 'cancelled'; continue; }\n        if (e.subjectFrom && e.subject && !sameSubject(l.subject, e.subject)) {\n          l.changes.subject = { from: l.subject, to: { name: e.subject.name || e.subject.short, short: e.subject.short } };\n        }\n        const added = e.teachersAdded || [];\n        if (e.teacherTo && e.teacherTo.length) {\n          l.changes.teacher = { from: e.teacherFrom.length ? e.teacherFrom.slice() : l.teachers.slice(), to: e.teacherTo.concat(added) };\n        } else if (e.teachers && e.teachers.length) {\n          const same = e.teachers.map(normName).sort().join('|') === l.teachers.map(normName).sort().join('|');\n          if (!same || added.length) l.changes.teacher = { from: e.teacherFrom.length ? e.teacherFrom.slice() : (same ? [] : l.teachers.slice()), to: e.teachers.concat(added) };\n        } else if (added.length) {\n          l.changes.teacher = { from: [], to: l.teachers.concat(added) };\n        } else if (e.teacherFrom && e.teacherFrom.length) {\n          l.changes.teacher = { from: e.teacherFrom.slice(), to: [] };\n        }\n        const newRoom = e.roomTo || e.room;\n        if (newRoom && !l.rooms.includes(newRoom)) {\n          l.changes.room = { from: e.roomFrom || l.rooms.join(', ') || null, to: newRoom };\n        }\n        if (Object.keys(l.changes).length && l.status === 'normal') l.status = 'changed';\n      }\n    }\n\n    return items\n      .filter((l) => groupVisible(l.groups, tt.divisions, prefs))\n      .sort((a, b) => a.from - b.from || (a.groups.join() || '').localeCompare(b.groups.join() || '', 'pl', { numeric: true }));\n  }\n\n  function effective(l) {\n    return {\n      subject: (l.changes.subject && l.changes.subject.to) || l.subject,\n      teachers: (l.changes.teacher && l.changes.teacher.to) || l.teachers,\n      rooms: l.changes.room ? [l.changes.room.to] : l.rooms,\n    };\n  }\n\n  function isActive(l) { return l.status !== 'cancelled' && l.status !== 'absent'; }\n\n  function buildTimeline(items) {\n    const slots = [];\n    for (const l of items) {\n      const last = slots[slots.length - 1];\n      if (last && l.from <= last.to) {\n        last.items.push(l);\n        last.to = Math.max(last.to, l.to);\n        if (toMin(l.end) > toMin(last.end)) last.end = l.end;\n      } else {\n        slots.push({ type: 'slot', key: 's' + l.from, from: l.from, to: l.to, start: l.start, end: l.end, items: [l] });\n      }\n    }\n    const rows = [];\n    slots.forEach((s, i) => {\n      s.active = s.items.some(isActive);\n      if (i > 0) {\n        const prev = slots[i - 1];\n        const gap = toMin(s.start) - toMin(prev.end);\n        if (s.from - prev.to > 1) rows.push({ type: 'free', key: 'f' + s.from, start: prev.end, end: s.start, minutes: gap, periods: s.from - prev.to - 1 });\n        else if (gap > 0) rows.push({ type: 'break', key: 'b' + s.from, start: prev.end, end: s.start, minutes: gap });\n      }\n      rows.push(s);\n    });\n    return rows;\n  }\n\n  function nowState(rows, nowMin) {\n    const slots = rows.filter((r) => r.type === 'slot');\n    const active = slots.filter((s) => s.active);\n    if (!active.length) return { type: 'none' };\n    const first = active[0];\n    const last = active[active.length - 1];\n    const nextActive = (min) => active.find((s) => toMin(s.start) > min) || null;\n\n    if (nowMin < toMin(first.start)) return { type: 'before', next: first, minutesLeft: toMin(first.start) - nowMin };\n    if (nowMin >= toMin(last.end)) return { type: 'after' };\n\n    const slot = slots.find((s) => nowMin >= toMin(s.start) && nowMin < toMin(s.end));\n    if (slot && slot.active) {\n      const st = toMin(slot.start); const en = toMin(slot.end);\n      const cur = slot.items.filter(isActive);\n      return { type: 'lesson', slot, key: slot.key, items: cur, next: nextActive(nowMin), minutesLeft: en - nowMin, progress: (nowMin - st) / Math.max(1, en - st) };\n    }\n    const next = nextActive(nowMin);\n    if (slot) return { type: 'free', reason: 'cancelled', key: slot.key, next, minutesLeft: next ? toMin(next.start) - nowMin : 0 };\n    const gapRow = rows.find((r) => r.type !== 'slot' && nowMin >= toMin(r.start) && nowMin < toMin(r.end));\n    if (gapRow && gapRow.type === 'break' && next && toMin(next.start) === toMin(gapRow.end)) {\n      return { type: 'break', key: gapRow.key, next, minutesLeft: toMin(gapRow.end) - nowMin };\n    }\n    return { type: 'free', key: gapRow ? gapRow.key : null, next, minutesLeft: next ? toMin(next.start) - nowMin : 0 };\n  }\n\n  return {\n    DAY_NAMES, DAY_SHORT, toMin, fmtMin, isoDate, parseIso, weekdayIndex, weekDates,\n    normGroup, groupVisible, mergeDay, effective, isActive, buildTimeline, nowState,\n  };\n}));\n"},"/plan-lib.js":{"type":"text/javascript; charset=utf-8","body":"(function () {\n  var defs = {};\n  defs['./html'] = function (module, exports, require) {\n'use strict';\n\nconst ENTITIES = {\n  amp: '&', lt: '<', gt: '>', quot: '\"', apos: \"'\", nbsp: ' ', ndash: '–', mdash: '—',\n  rarr: '→', larr: '←', hellip: '…', oacute: 'ó', Oacute: 'Ó',\n};\n\nfunction decodeEntities(s) {\n  return String(s).replace(/&(#x[0-9a-f]+|#\\d+|[a-z]+);/gi, (m, e) => {\n    if (e[0] === '#') {\n      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);\n      return Number.isFinite(code) ? String.fromCodePoint(code) : m;\n    }\n    return Object.prototype.hasOwnProperty.call(ENTITIES, e) ? ENTITIES[e] : m;\n  });\n}\n\nfunction parseAttrs(src) {\n  const attrs = {};\n  const re = /([^\\s=/>\"']+)(?:\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+)))?/g;\n  let m;\n  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');\n  return attrs;\n}\n\nconst BLOCK = new Set([\n  'div', 'p', 'li', 'ul', 'ol', 'tr', 'td', 'th', 'table', 'tbody', 'thead', 'section', 'header', 'footer',\n  'article', 'main', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'dd', 'dt', 'dl', 'caption',\n]);\nconst SKIP_CONTENT = new Set(['script', 'style', 'noscript', 'template']);\n\nfunction htmlToLines(html) {\n  const lines = [];\n  let buf = '';\n  const stack = [];\n  const flush = () => {\n    const text = decodeEntities(buf).replace(/\\s+/g, ' ').trim();\n    if (text) {\n      const hints = stack.map((s) => s.cls).filter(Boolean).join(' ').split(/\\s+/).filter(Boolean);\n      lines.push({ text, hints, depth: stack.length });\n    }\n    buf = '';\n  };\n  const re = /<!--[\\s\\S]*?-->|<(\\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*?)(\\/?)>|([^<]+)|</g;\n  let m;\n  while ((m = re.exec(html))) {\n    if (m[5] !== undefined) { buf += m[5]; continue; }\n    if (!m[2]) { if (m[0] === '<') buf += '<'; continue; }\n    const closing = m[1] === '/';\n    const tag = m[2].toLowerCase();\n    const selfClose = m[4] === '/' || tag === 'br' || tag === 'img' || tag === 'hr' || tag === 'input' || tag === 'meta' || tag === 'link';\n    if (!closing && SKIP_CONTENT.has(tag)) {\n      const end = html.toLowerCase().indexOf('</' + tag, re.lastIndex);\n      re.lastIndex = end < 0 ? html.length : end;\n      continue;\n    }\n    if (BLOCK.has(tag)) flush();\n    if (closing) {\n      for (let i = stack.length - 1; i >= 0; i--) {\n        if (stack[i].tag === tag) { stack.length = i; break; }\n      }\n    } else if (!selfClose) {\n      const cls = BLOCK.has(tag) ? (parseAttrs(m[3]).class || '') : '';\n      if (BLOCK.has(tag)) stack.push({ tag, cls });\n    }\n  }\n  flush();\n  return lines;\n}\n\nmodule.exports = { decodeEntities, parseAttrs, htmlToLines };\n\n};\n  defs['./substitutions'] = function (module, exports, require) {\n'use strict';\n\nconst { htmlToLines, decodeEntities } = require('./html');\n\nconst ARROW = /\\s*(?:➔|→|⇒|->|=>)\\s*/;\nconst TIME_RANGE = /^(\\d{1,2}:\\d{2})\\s*[-–]\\s*(\\d{1,2}:\\d{2})\\s*,?\\s*/;\nconst PERIOD_RE = /^\\(?\\s*(\\d{1,2})(?:\\s*[-–]\\s*(\\d{1,2}))?\\s*\\)?$/;\nconst ALL_DAY_RE = /^\\(?\\s*ca[łl]y\\s+dzie[ńn]\\s*\\)?$/i;\nconst NO_SUBST_RE = /nie\\s+ma\\s+(?:żadnych\\s+)?zast[ęe]pstw/i;\nconst CANCEL_RE = /^(anulowan|odwo[łl]an|lekcja\\s+odwo[łl]ana|cancel)/i;\nconst ABSENT_RE = /nieobecno[śs][ćc]/i;\n\nconst NAME_RE = /^[A-ZĄĆĘŁŃÓŚŹŻ][\\p{L}'’.-]+(?:\\s+[A-ZĄĆĘŁŃÓŚŹŻ][\\p{L}'’.-]+){1,3}$/u;\n\nfunction pad(t) {\n  const m = /^(\\d{1,2}):(\\d{2})$/.exec(t || '');\n  return m ? m[1].padStart(2, '0') + ':' + m[2] : t;\n}\n\nfunction splitTopLevel(s) {\n  const out = [];\n  let depth = 0;\n  let cur = '';\n  for (const ch of s) {\n    if (ch === '(') depth++;\n    if (ch === ')') depth = Math.max(0, depth - 1);\n    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }\n    cur += ch;\n  }\n  if (cur.trim()) out.push(cur.trim());\n  return out.filter(Boolean);\n}\n\nfunction splitChange(value) {\n  const m = /^\\((.*)\\)\\s*(?:➔|→|⇒|->|=>)\\s*(.*)$/.exec(value.trim());\n  if (m) return { from: m[1].trim(), to: m[2].trim() };\n  const parts = value.split(ARROW);\n  if (parts.length === 2) return { from: parts[0].replace(/^\\(|\\)$/g, '').trim(), to: parts[1].trim() };\n  return { to: value.trim() };\n}\n\nfunction labelKind(label) {\n  const l = label.toLowerCase();\n  if (/zast|nauczyc|prowadz|teacher/.test(l)) return 'teacher';\n  if (/sal[aęi]|room|klasar|pomieszcz/.test(l)) return 'room';\n  if (/przedmiot|subject/.test(l)) return 'subject';\n  if (/grup|group/.test(l)) return 'group';\n  return 'note';\n}\n\nfunction parsePeriodText(text) {\n  const t = text.trim();\n  if (ALL_DAY_RE.test(t)) return { allDay: true, cancelledHint: t.startsWith('(') };\n  const m = PERIOD_RE.exec(t);\n  if (!m) return null;\n  const from = Number(m[1]);\n  const to = m[2] ? Number(m[2]) : from;\n  return { from: Math.min(from, to), to: Math.max(from, to), cancelledHint: t.startsWith('(') };\n}\n\nfunction parseInfo(text, period, hints, subjectNames) {\n  const e = {\n    periodFrom: period && !period.allDay ? period.from : null,\n    periodTo: period && !period.allDay ? period.to : null,\n    allDay: !!(period && period.allDay),\n    start: null, end: null,\n    groups: [],\n    subject: null, subjectFrom: null,\n    teachers: [], teacherFrom: [], teacherTo: [], teachersAdded: [],\n    room: null, roomFrom: null, roomTo: null,\n    cancelled: false, absent: false,\n    notes: [],\n    raw: text,\n  };\n  let rest = text.trim();\n  const tm = TIME_RANGE.exec(rest);\n  if (tm) { e.start = pad(tm[1]); e.end = pad(tm[2]); rest = rest.slice(tm[0].length); }\n\n  if (hints.includes('absent') || (ABSENT_RE.test(rest) && !/ - /.test(rest))) {\n    e.absent = true;\n    e.notes.push(rest.trim() || 'Nieobecność');\n    return e;\n  }\n\n  const dash = rest.search(/\\s[-–]\\s/);\n  let head = dash >= 0 ? rest.slice(0, dash) : rest;\n  const tail = dash >= 0 ? rest.slice(dash).replace(/^\\s[-–]\\s/, '') : '';\n\n  const gm = /^([^():]{1,30}):\\s+(.+)$/.exec(head.trim());\n  if (gm) { e.groups = gm[1].split(/\\s*,\\s*/).filter(Boolean); head = gm[2]; }\n  const sc = splitChange(head);\n  const subj = (s) => (s ? { short: s, name: (subjectNames && (subjectNames[s] || subjectNames[s.toLowerCase()])) || null } : null);\n  if (sc.from !== undefined) { e.subjectFrom = subj(sc.from); e.subject = subj(sc.to); } else { e.subject = subj(sc.to); }\n\n  let last = 'start';\n  for (const seg of splitTopLevel(tail)) {\n    if (CANCEL_RE.test(seg)) { e.cancelled = true; last = 'cancel'; continue; }\n\n    const plus = /^\\+\\s*(.+)$/.exec(seg);\n    if (plus && NAME_RE.test(plus[1].trim())) { e.teachersAdded.push(plus[1].trim()); last = 'added'; continue; }\n\n    const gone = /^\\((.+)\\)$/.exec(seg);\n    if (gone && splitTopLevel(gone[1]).every((n) => NAME_RE.test(n))) { e.teacherFrom.push(...splitTopLevel(gone[1])); last = 'gone'; continue; }\n    const lm = /^([\\p{L} ]{3,40}?)\\s*:\\s*(.*)$/u.exec(seg);\n    if (lm) {\n      const kind = labelKind(lm[1]);\n      const v = splitChange(lm[2].replace(/^[-–]\\s+/, ''));\n      if (kind === 'teacher') {\n        if (v.from !== undefined) {\n          e.teacherFrom.push(...splitTopLevel(v.from));\n          e.teacherTo.push(v.to);\n          last = 'teacherTo';\n        } else { e.teachers.push(v.to); last = 'teachers'; }\n      } else if (kind === 'room') {\n        if (v.from !== undefined) { e.roomFrom = v.from; e.roomTo = v.to; } else e.room = v.to;\n        last = 'room';\n      } else if (kind === 'subject') {\n        if (v.from !== undefined) e.subjectFrom = subj(v.from);\n        e.subject = subj(v.to);\n        last = 'subject';\n      } else if (kind === 'group') {\n        e.groups.push(...v.to.split(/\\s*,\\s*/)); last = 'group';\n      } else { e.notes.push(seg); last = 'note'; }\n      continue;\n    }\n    if (NAME_RE.test(seg) && (last === 'start' || last === 'teachers' || last === 'teacherTo')) {\n      if (last === 'teacherTo') e.teacherTo.push(seg); else { e.teachers.push(seg); last = 'teachers'; }\n      continue;\n    }\n    if (last === 'note' && /^[a-ząćęłńóśźż0-9]/.test(seg)) {\n      e.notes[e.notes.length - 1] += ', ' + seg;\n      continue;\n    }\n    e.notes.push(seg);\n    last = 'note';\n  }\n  if (period && period.cancelledHint) e.cancelled = true;\n  if (hints.includes('remove')) e.cancelled = true;\n  return e;\n}\n\nfunction extractReportHtml(input) {\n  let s = String(input || '');\n  const rm = /\"report_html\"\\s*:\\s*(\"(?:[^\"\\\\]|\\\\.)*\")/.exec(s);\n  if (rm) {\n    try { return JSON.parse(rm[1]); } catch (_) {}\n  }\n  const i = s.search(/<[^>]+data-date\\s*=/);\n  if (i >= 0) s = s.slice(i);\n  return s;\n}\n\nfunction parseClassList(value) {\n  return splitTopLevel(value).map((item) => {\n    const m = /^(.*?)\\s*(?:\\(\\s*(\\d{1,2})(?:\\s*[-–]\\s*(\\d{1,2}))?\\s*\\))?$/.exec(item.trim());\n    const name = (m ? m[1] : item).trim();\n    const from = m && m[2] ? Number(m[2]) : null;\n    const to = m && m[3] ? Number(m[3]) : from;\n    return { name, from, to };\n  }).filter((x) => x.name);\n}\n\nfunction parseSubstitutions(input, opts = {}) {\n  const html = extractReportHtml(input);\n  const dm = /data-date\\s*=\\s*[\"'](\\d{4}-\\d{2}-\\d{2})[\"']/.exec(html);\n  const out = {\n    date: dm ? dm[1] : opts.date || null,\n    updatedAt: null,\n    info: {},\n    absentClasses: [],\n    empty: false,\n    classes: {},\n  };\n  const lines = htmlToLines(html);\n  let current = null;\n  let pending = null;\n  let inSections = false;\n\n  for (const line of lines) {\n    const t = decodeEntities(line.text).trim();\n    if (!t) continue;\n    if (/asctimetables|edupage\\.org/i.test(t)) {\n      const um = /(\\d{2})\\.(\\d{2})\\.(\\d{4})\\s+(\\d{1,2}:\\d{2})/.exec(t);\n      if (um) out.updatedAt = `${um[3]}-${um[2]}-${um[1]}T${pad(um[4])}`;\n      continue;\n    }\n    if (NO_SUBST_RE.test(t)) { out.empty = true; pending = null; continue; }\n\n    const period = parsePeriodText(t);\n    if (period && current) { pending = { ...period, hints: line.hints }; continue; }\n\n    if (pending || (current && TIME_RANGE.test(t))) {\n      const hints = [...new Set([...(pending ? pending.hints : []), ...line.hints])];\n      const entry = parseInfo(t, pending, hints, opts.subjectNames);\n      (out.classes[current] = out.classes[current] || []).push(entry);\n      pending = null;\n      continue;\n    }\n\n    const lab = /^([^:]{3,45}):\\s*(.*)$/.exec(t);\n    if (!inSections && lab && !TIME_RANGE.test(t)) {\n      out.info[lab[1].trim()] = lab[2].trim();\n      if (/klasy|oddzia/i.test(lab[1]) && /nieobec/i.test(lab[1])) out.absentClasses = parseClassList(lab[2]);\n      continue;\n    }\n\n    if (t.length <= 30) { current = t; inSections = true; pending = null; continue; }\n  }\n  if (!Object.keys(out.classes).length && !out.empty && !lines.some((l) => /\\d:\\d\\d/.test(l.text))) out.empty = true;\n  return out;\n}\n\nfunction normKey(s) { return String(s || '').toLowerCase().replace(/\\s+/g, ''); }\n\nfunction entriesForClass(parsed, cls) {\n  const keys = new Set([normKey(cls.short), normKey(cls.name), normKey(String(cls.name || '').split(/\\s+/)[0])].filter(Boolean));\n  const entries = [];\n  for (const [header, list] of Object.entries(parsed.classes || {})) {\n    if (keys.has(normKey(header))) entries.push(...list);\n  }\n  for (const a of parsed.absentClasses || []) {\n    if (!keys.has(normKey(a.name))) continue;\n    const covered = entries.some((e) => e.absent && (e.allDay || (a.from != null && e.periodFrom <= a.from && e.periodTo >= a.to)));\n    if (!covered) {\n      entries.push({\n        periodFrom: a.from, periodTo: a.to, allDay: a.from == null, start: null, end: null, groups: [],\n        subject: null, subjectFrom: null, teachers: [], teacherFrom: [], teacherTo: [], room: null, roomFrom: null, roomTo: null,\n        cancelled: false, absent: true, notes: ['Nieobecność klasy'], raw: '',\n      });\n    }\n  }\n  return entries;\n}\n\nmodule.exports = { parseSubstitutions, entriesForClass, parseInfo, splitTopLevel, extractReportHtml };\n\n};\n  defs['./timetable'] = function (module, exports, require) {\n'use strict';\n\nconst DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];\nconst DAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];\n\nfunction pad(t) {\n  const m = /^(\\d{1,2}):(\\d{2})/.exec(String(t || '').trim());\n  return m ? m[1].padStart(2, '0') + ':' + m[2] : null;\n}\n\nfunction getTables(resp) {\n  const candidates = [\n    resp && resp.r && resp.r.dbiAccessorRes && resp.r.dbiAccessorRes.tables,\n    resp && resp.dbiAccessorRes && resp.dbiAccessorRes.tables,\n    resp && resp.r && resp.r.tables,\n    resp && resp.tables,\n  ];\n  let list = candidates.find(Array.isArray);\n  if (!list) {\n    const seen = new Set();\n    const walk = (o, d) => {\n      if (!o || typeof o !== 'object' || seen.has(o) || d > 6) return null;\n      seen.add(o);\n      if (Array.isArray(o) && o.length && o.every((x) => x && typeof x.id === 'string' && Array.isArray(x.data_rows))) return o;\n      for (const v of Object.values(o)) { const r = walk(v, d + 1); if (r) return r; }\n      return null;\n    };\n    list = walk(resp, 0);\n  }\n  if (!list) throw new Error('Nie znaleziono tabel planu w odpowiedzi EduPage');\n  const T = {};\n  for (const t of list) T[t.id] = Array.isArray(t.data_rows) ? t.data_rows : [];\n  return T;\n}\n\nfunction byId(rows) {\n  const m = new Map();\n  for (const r of rows || []) m.set(String(r.id), r);\n  return m;\n}\n\nfunction listClasses(resp) {\n  const T = getTables(resp);\n  return (T.classes || [])\n    .map((c) => ({ id: String(c.id), name: String(c.name || c.short || '').trim(), short: String(c.short || c.name || '').trim() }))\n    .filter((c) => c.name)\n    .sort((a, b) => a.name.localeCompare(b.name, 'pl', { numeric: true }));\n}\n\nfunction findClass(classes, query) {\n  const q = String(query || '').trim().toLowerCase().replace(/[\\s-]+/g, '');\n  if (!q) return null;\n  const norm = (s) => String(s || '').toLowerCase().replace(/[\\s-]+/g, '');\n  return classes.find((c) => c.id === query)\n    || classes.find((c) => norm(c.name) === q)\n    || classes.find((c) => norm(c.short) === q)\n    || classes.find((c) => norm(c.name).startsWith(q))\n    || null;\n}\n\nfunction teacherName(t) {\n  if (!t) return null;\n  const full = [t.lastname, t.firstname].filter(Boolean).join(' ').trim();\n  return String(t.name || full || t.short || '').trim() || null;\n}\n\nfunction dayIndexes(card, lesson, daysdefs) {\n  let s = card && typeof card.days === 'string' ? card.days : '';\n  if (!/1/.test(s) && lesson && lesson.daysdefid && daysdefs.get(String(lesson.daysdefid))) {\n    const vals = daysdefs.get(String(lesson.daysdefid)).vals || [];\n    if (vals.length === 1) s = vals[0];\n  }\n  const out = [];\n  for (let i = 0; i < s.length; i++) if (s[i] === '1') out.push(i);\n  return out;\n}\n\nfunction buildTimetable(resp, classQuery, meta = {}) {\n  const T = getTables(resp);\n  const classes = listClasses(resp);\n  const cls = findClass(classes, classQuery);\n  if (!cls) {\n    const e = new Error(`Nie znaleziono klasy „${classQuery}” w planie`);\n    e.code = 'CLASS_NOT_FOUND';\n    throw e;\n  }\n\n  const periodsRaw = (T.periods || [])\n    .map((p) => ({ key: String(p.period ?? p.id), id: String(p.id), n: Number(p.period ?? p.short ?? p.name), label: String(p.short || p.name || p.period), start: pad(p.starttime), end: pad(p.endtime) }))\n    .filter((p) => Number.isFinite(p.n) && p.start && p.end)\n    .sort((a, b) => a.n - b.n);\n  const periodIndex = new Map();\n  periodsRaw.forEach((p, i) => { periodIndex.set(p.key, i); periodIndex.set(p.id, i); });\n\n  const subjects = byId(T.subjects);\n  const teachers = byId(T.teachers);\n  const rooms = byId(T.classrooms);\n  const groups = byId(T.groups);\n  const daysdefs = byId(T.daysdefs);\n  const lessonsById = new Map();\n  for (const l of T.lessons || []) {\n    const cids = (l.classids || []).map(String);\n    if (cids.includes(cls.id)) lessonsById.set(String(l.id), l);\n  }\n\n  const days = (T.days && T.days.length ? T.days : DAY_NAMES.slice(0, 5).map((n, i) => ({ id: String(i), name: n })))\n    .map((d, i) => ({ index: i, name: d.name || DAY_NAMES[i], short: DAY_SHORT[i] || d.short }));\n\n  const divisions = new Map();\n  const lessons = [];\n  const seen = new Set();\n  for (const card of T.cards || []) {\n    const lesson = lessonsById.get(String(card.lessonid));\n    if (!lesson) continue;\n    const pi = periodIndex.get(String(card.period));\n    if (pi === undefined) continue;\n    const dur = Math.max(1, Number(lesson.durationperiods) || 1);\n    const pFrom = periodsRaw[pi];\n    const pTo = periodsRaw[Math.min(periodsRaw.length - 1, pi + dur - 1)];\n    const subj = subjects.get(String(lesson.subjectid)) || {};\n    const groupObjs = (lesson.groupids || []).map((g) => groups.get(String(g))).filter(Boolean)\n      .filter((g) => String(g.classid) === cls.id || !g.classid);\n    const partial = groupObjs.filter((g) => !g.entireclass);\n    for (const g of partial) {\n      const div = String(g.divisionid || 'div');\n      if (!divisions.has(div)) divisions.set(div, new Set());\n      divisions.get(div).add(String(g.name));\n    }\n    const roomList = (card.classroomids || []).map((r) => rooms.get(String(r))).filter(Boolean).map((r) => String(r.short || r.name));\n    for (const day of dayIndexes(card, lesson, daysdefs)) {\n      const item = {\n        id: `${card.id || card.lessonid}-${day}`,\n        day,\n        from: pFrom.n,\n        to: pTo.n,\n        start: pFrom.start,\n        end: pTo.end,\n        subject: { name: String(subj.name || subj.short || '?'), short: String(subj.short || subj.name || '?') },\n        teachers: (lesson.teacherids || []).map((t) => teachers.get(String(t))).filter(Boolean)\n          .map((t) => ({ name: teacherName(t), short: t.short || null })),\n        rooms: roomList,\n        groups: partial.map((g) => String(g.name)),\n        weeks: typeof card.weeks === 'string' && /0/.test(card.weeks) ? card.weeks : null,\n      };\n      const key = [item.day, item.from, item.subject.short, item.groups.join(','), item.rooms.join(',')].join('|');\n      if (seen.has(key)) continue;\n      seen.add(key);\n      lessons.push(item);\n    }\n  }\n  lessons.sort((a, b) => a.day - b.day || a.from - b.from || a.groups.join().localeCompare(b.groups.join()));\n\n  const result = {\n    class: cls,\n    timetable: meta.ttName || null,\n    validFrom: meta.validFrom || null,\n    periods: periodsRaw.map((p) => ({ n: p.n, label: p.label, start: p.start, end: p.end })),\n    days,\n    divisions: [...divisions.entries()].map(([id, set]) => ({ id, groups: [...set].sort((a, b) => a.localeCompare(b, 'pl', { numeric: true })) })),\n    lessons,\n  };\n  result.hash = hashOf(result);\n  return result;\n}\n\nfunction hashOf(tt) {\n  return fnv(JSON.stringify({ p: tt.periods, l: tt.lessons }));\n}\n\nfunction subjectDictionary(...responses) {\n  const dict = {};\n  for (const resp of responses) {\n    if (!resp) continue;\n    let T;\n    try { T = getTables(resp); } catch (_) { continue; }\n    for (const s of T.subjects || []) {\n      if (s.short && s.name && !dict[s.short]) dict[s.short] = s.name;\n    }\n  }\n  return dict;\n}\n\nfunction fnv(str) {\n  let h = 0x811c9dc5;\n  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }\n  return h.toString(16).padStart(8, '0') + str.length.toString(16);\n}\n\nconst KEEP = {\n  periods: ['id', 'period', 'name', 'short', 'starttime', 'endtime'],\n  days: ['id', 'name', 'short'],\n  daysdefs: ['id', 'vals'],\n  classes: ['id', 'name', 'short'],\n  subjects: ['id', 'name', 'short'],\n  teachers: ['id', 'name', 'short', 'firstname', 'lastname'],\n  classrooms: ['id', 'name', 'short'],\n  groups: ['id', 'name', 'classid', 'entireclass', 'divisionid'],\n  lessons: ['id', 'subjectid', 'teacherids', 'groupids', 'classids', 'durationperiods', 'daysdefid'],\n  cards: ['id', 'lessonid', 'period', 'days', 'weeks', 'classroomids'],\n};\nfunction slimRaw(resp) {\n  const T = getTables(resp);\n  const tables = Object.entries(KEEP).map(([id, fields]) => ({\n    id,\n    data_rows: (T[id] || []).map((row) => {\n      const o = {};\n      for (const f of fields) if (row[f] !== undefined) o[f] = row[f];\n      return o;\n    }),\n  }));\n  return { r: { dbiAccessorRes: { tables } } };\n}\n\nmodule.exports = { slimRaw, getTables, listClasses, findClass, buildTimetable, subjectDictionary, hashOf, pad };\n\n};\n  defs['./edupage'] = function (module, exports, require) {\n'use strict';\n\nconst USER_AGENT = 'Mozilla/5.0 (PlanLekcji) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';\n\nfunction normalizeEdupage(input) {\n  let s = String(input || '').trim().toLowerCase();\n  s = s.replace(/^[a-z]+:\\/\\//, '').split(/[/?#]/)[0].replace(/:\\d+$/, '').replace(/\\.$/, '');\n  s = s.replace(/\\.edupage\\.org$/, '');\n  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(s) ? s : null;\n}\n\nfunction schoolNameFromHtml(html) {\n  const m = /\"school_name\"\\s*:\\s*(\"(?:[^\"\\\\]|\\\\.)*\")/.exec(html || '');\n  let name = null;\n  if (m) { try { name = JSON.parse(m[1]); } catch (_) { name = null; } }\n  if (!name) {\n    const t = /<title>([^<]*)<\\/title>/i.exec(html || '');\n    if (t && t[1].includes('|')) name = t[1].split('|').slice(1).join('|');\n  }\n  if (!name) return null;\n  name = name.replace(/&nbsp;/g, ' ').replace(/\\s+/g, ' ').trim();\n  name = name.split(/,\\s*(?:ul\\.|ulica|al\\.|aleja|os\\.|pl\\.)\\s/i)[0].trim();\n  return name || null;\n}\n\nfunction notConfigured() {\n  const e = new Error('Nie ustawiono adresu EduPage szkoły.');\n  e.code = 'NOT_CONFIGURED';\n  return e;\n}\n\nfunction warsawToday(date = new Date()) {\n  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(date);\n}\n\nfunction schoolYear(dateStr = warsawToday()) {\n  const [y, m] = dateStr.split('-').map(Number);\n  return m >= 8 ? y : y - 1;\n}\n\nclass EduPageClient {\n  constructor({ subdomain = null, base = null, timeoutMs = 20000, log = () => {} } = {}) {\n    this.edupage = normalizeEdupage(subdomain);\n    this.base = base || (this.edupage ? `https://${this.edupage}.edupage.org` : null);\n    this.timeoutMs = timeoutMs;\n    this.log = log;\n    this._session = null;\n  }\n\n  async _fetch(url, opts = {}) {\n    const ctrl = new AbortController();\n    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);\n    try {\n      const res = await fetch(url, {\n        ...opts,\n        signal: ctrl.signal,\n        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pl,en;q=0.8', ...(opts.headers || {}) },\n      });\n      if (!res.ok) throw new Error(`EduPage odpowiedział ${res.status} dla ${url.replace(this.base, '')}`);\n      return res;\n    } catch (e) {\n      if (e.name === 'AbortError') throw new Error(`Przekroczono czas oczekiwania na EduPage (${url.replace(this.base, '')})`);\n      throw e;\n    } finally {\n      clearTimeout(timer);\n    }\n  }\n\n  async session(force = false) {\n    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;\n    if (!this.base) throw notConfigured();\n    const res = await this._fetch(this.base + '/timetable/');\n    const html = await res.text();\n    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);\n    const cookie = setCookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ');\n    const gsh = (/gsechash\\s*=\\s*[\"']([0-9a-fA-F]+)[\"']/.exec(html) || [])[1] || '00000000';\n    const year = Number((/\"year_auto\"\\s*:\\s*(\\d{4})/.exec(html) || [])[1]) || schoolYear();\n    if (!/ASC\\.|edupage/i.test(html)) throw new Error('Pod tym adresem nie ma strony EduPage.');\n    this._session = { cookie, gsh, year, school: schoolNameFromHtml(html), at: Date.now() };\n    return this._session;\n  }\n\n  async call(path, args, { retry = true } = {}) {\n    const s = await this.session();\n    try {\n      const res = await this._fetch(this.base + path, {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json; charset=UTF-8',\n          Accept: 'application/json, text/javascript, */*',\n          Referer: this.base + '/timetable/',\n          'X-Requested-With': 'XMLHttpRequest',\n          ...(s.cookie ? { Cookie: s.cookie } : {}),\n        },\n        body: JSON.stringify({ __args: args, __gsh: s.gsh }),\n      });\n      const text = await res.text();\n      let json;\n      try { json = JSON.parse(text); } catch (_) { throw new Error(`EduPage zwrócił nie-JSON dla ${path}`); }\n      if (json && json.r === undefined && json.err) throw new Error(`EduPage: ${JSON.stringify(json.err).slice(0, 200)}`);\n      return json;\n    } catch (e) {\n      if (!retry) throw e;\n      this.log(`retrying ${path} with a fresh session: ${e.message}`);\n      await this.session(true);\n      return this.call(path, args, { retry: false });\n    }\n  }\n\n  async currentTimetable(today = warsawToday()) {\n    const s = await this.session();\n    const v = await this.call('/timetable/server/ttviewer.js?__func=getTTViewerData', [null, s.year]);\n    const reg = (v && v.r && v.r.regular) || {};\n    const list = Array.isArray(reg.timetables) ? reg.timetables : [];\n    const visible = list.filter((t) => !t.hidden);\n    const started = visible.filter((t) => !t.datefrom || t.datefrom <= today).sort((a, b) => String(b.datefrom).localeCompare(String(a.datefrom)));\n    const pick = started[0] || visible.find((t) => String(t.tt_num) === String(reg.default_num)) || visible[0] || list.find((t) => String(t.tt_num) === String(reg.default_num));\n    const ttNum = pick ? String(pick.tt_num) : reg.default_num ? String(reg.default_num) : null;\n    if (!ttNum) throw new Error('EduPage nie podał żadnego opublikowanego planu');\n    return { ttNum, name: pick ? pick.text : null, validFrom: pick ? pick.datefrom : null, year: s.year };\n  }\n\n  async regularTimetable(ttNum) {\n    return this.call('/timetable/server/regulartt.js?__func=regularttGetData', [null, String(ttNum)]);\n  }\n\n  async dictionary() {\n    const s = await this.session();\n    return this.call('/rpr/server/maindbi.js?__func=mainDBIAccessor', [null, s.year, {}, {\n      op: 'fetch',\n      needed_part: { teachers: ['short', 'name', 'firstname', 'lastname'], subjects: ['short', 'name'], classes: ['short', 'name'], classrooms: ['short', 'name'] },\n      needed_combos: {},\n    }]);\n  }\n\n  async substitutionHtml(date) {\n    const errors = [];\n    try {\n      const j = await this.call('/substitution/server/viewer.js?__func=getSubstViewerDayDataHtml', [null, { date, mode: 'classes' }]);\n      if (j && typeof j.r === 'string') return { html: j.r, via: 'api' };\n      errors.push('API zastępstw zwróciło nieoczekiwany format');\n    } catch (e) { errors.push(e.message); }\n\n    try {\n      const res = await this._fetch(`${this.base}/substitution/?date=${encodeURIComponent(date)}`);\n      const html = await res.text();\n      const dm = /data-date\\\\?[\"']?\\s*[:=]\\s*\\\\?[\"'](\\d{4}-\\d{2}-\\d{2})/.exec(html) || /\"date\"\\s*:\\s*\"(\\d{4}-\\d{2}-\\d{2})\"/.exec(html);\n      if (dm && dm[1] !== date) throw new Error(`strona zastępstw pokazała ${dm[1]} zamiast ${date}`);\n      return { html, via: 'page' };\n    } catch (e) { errors.push(e.message); }\n    throw new Error('Nie udało się pobrać zastępstw: ' + errors.join(' / '));\n  }\n}\n\nmodule.exports = { EduPageClient, warsawToday, schoolYear, normalizeEdupage, schoolNameFromHtml, notConfigured };\n\n};\n  defs['./api'] = function (module, exports, require) {\n'use strict';\n\nconst { warsawToday } = require('./edupage');\nconst { listClasses, buildTimetable, subjectDictionary, findClass, slimRaw } = require('./timetable');\nconst { parseSubstitutions, entriesForClass } = require('./substitutions');\n\nconst MIN = 60 * 1000;\n\nfunction createApi({ client, store, offline = false, timetableTtlMin = 30, substTtlMin = 5, fallback = null, log = () => {} }) {\n  const built = new Map();\n\n  function offlineGuard() {\n    if (offline) throw new Error('Tryb offline: używam tylko zapisanych danych');\n  }\n\n  async function timetableBundle({ force = false } = {}) {\n    return store.get('timetable', timetableTtlMin * MIN, async () => {\n      offlineGuard();\n      const tt = await client.currentTimetable();\n      const raw = slimRaw(await client.regularTimetable(tt.ttNum));\n      const classes = listClasses(raw);\n      if (!classes.length) throw new Error('Plan z EduPage nie zawiera żadnych klas');\n      log(`timetable ${tt.ttNum} „${tt.name}” loaded (${classes.length} classes)`);\n      return { raw, ttNum: tt.ttNum, name: tt.name, validFrom: tt.validFrom, source: 'api' };\n    }, { force });\n  }\n\n  async function dictionary() {\n    try {\n      const rec = await store.get('dictionary', 12 * 60 * MIN, async () => { offlineGuard(); return client.dictionary(); });\n      return rec.value;\n    } catch (e) {\n      log('dictionary unavailable:', e.message);\n      return null;\n    }\n  }\n\n  async function timetableForClass(classQuery, { force = false } = {}) {\n    let bundle = null;\n    let firstError = null;\n    try { bundle = await timetableBundle({ force }); } catch (e) { firstError = e; }\n    if (bundle) {\n      const key = `${classQuery}|${bundle.fetchedAt}`;\n      let tt = built.get(key);\n      if (!tt) {\n        tt = buildTimetable(bundle.value.raw, classQuery, { ttName: bundle.value.name, validFrom: bundle.value.validFrom });\n        if (built.size > 60) built.clear();\n        built.set(key, tt);\n      }\n      return { ...tt, source: bundle.value.source, fetchedAt: bundle.fetchedAt, stale: bundle.stale, error: bundle.error };\n    }\n    if (!offline && fallback) {\n      log(`JSON route failed (${firstError.message}); trying fallback for ${classQuery}`);\n      const tt = await fallback(classQuery, store);\n      return { ...tt, error: firstError.message };\n    }\n    throw firstError;\n  }\n\n  async function substitutionsForDate(date) {\n    const ttl = date < warsawToday() ? 6 * 60 * MIN : substTtlMin * MIN;\n    return store.get(`subst-${date}`, ttl, async () => {\n      offlineGuard();\n      const { html, via } = await client.substitutionHtml(date);\n      const parsed = parseSubstitutions(html, { date });\n      if (parsed.date && parsed.date !== date) throw new Error(`EduPage zwrócił zastępstwa na ${parsed.date} zamiast ${date}`);\n      return { ...parsed, via };\n    });\n  }\n\n  function nameSubjects(entries, dict) {\n    if (!dict) return entries;\n    const fill = (s) => (s && !s.name ? { ...s, name: dict[s.short] || dict[String(s.short).toLowerCase()] || null } : s);\n    return entries.map((e) => ({ ...e, subject: fill(e.subject), subjectFrom: fill(e.subjectFrom) }));\n  }\n\n  async function check(cls) {\n    const out = [];\n    const ok = (m) => out.push('✓ ' + m);\n    const bad = (m) => out.push('✗ ' + m);\n    try {\n      const s = await client.session(true);\n      ok(`strona EduPage odpowiada: ${s.school || client.base} (rok ${s.year})`);\n      const tt = await client.currentTimetable();\n      ok(`aktualny plan: ${tt.name || tt.ttNum}`);\n      const raw = await client.regularTimetable(tt.ttNum);\n      const classes = listClasses(raw);\n      ok(`liczba klas w planie: ${classes.length}`);\n      const pick = cls || (classes[0] && classes[0].name);\n      if (pick) {\n        const t = buildTimetable(raw, pick);\n        ok(`${t.class.name}: ${t.lessons.length} lekcji w tygodniu`);\n      }\n    } catch (e) { bad((e.code === 'NOT_CONFIGURED' ? '' : 'plan: ') + e.message); return out.join('\\n') + '\\n'; }\n    try {\n      const date = warsawToday();\n      const { html, via } = await client.substitutionHtml(date);\n      const p = parseSubstitutions(html, { date });\n      ok(`zastępstwa ${date} (${via}): ${p.empty ? 'brak zastępstw w szkole' : Object.keys(p.classes).length + ' klas ze zmianami'}`);\n    } catch (e) { bad('zastępstwa: ' + e.message); }\n    return out.join('\\n') + '\\n';\n  }\n\n  async function handle(url) {\n    const p = url.pathname;\n    const force = url.searchParams.get('refresh') === '1';\n    try {\n      if (p === '/api/health') {\n        const tt = await store.peek('timetable');\n        return { status: 200, body: { ok: true, edupage: client.base, today: warsawToday(), timetableCachedAt: tt ? new Date(tt.fetchedAt).toISOString() : null, offline } };\n      }\n      if (p === '/api/school') {\n        const rec = await store.get('school', 12 * 60 * MIN, async () => {\n          offlineGuard();\n          const s = await client.session();\n          return { name: s.school || null, edupage: client.edupage || null, url: client.base };\n        }, { force });\n        return { status: 200, body: { ...rec.value, stale: rec.stale } };\n      }\n      if (p === '/api/check') {\n        return { status: 200, body: await check(url.searchParams.get('class') || '') };\n      }\n      if (p === '/api/classes') {\n        const b = await timetableBundle({ force });\n        return { status: 200, body: { classes: listClasses(b.value.raw), timetable: b.value.name, fetchedAt: b.fetchedAt, stale: b.stale, error: b.error } };\n      }\n      if (p === '/api/timetable') {\n        const cls = url.searchParams.get('class');\n        if (!cls) return { status: 400, body: { error: 'Brak parametru class' } };\n        try {\n          return { status: 200, body: await timetableForClass(cls, { force }) };\n        } catch (e) {\n          if (e.code === 'CLASS_NOT_FOUND') return { status: 404, body: { error: e.message, code: e.code } };\n          throw e;\n        }\n      }\n      if (p === '/api/substitutions') {\n        const clsQuery = url.searchParams.get('class') || '';\n        const dates = (url.searchParams.get('dates') || warsawToday()).split(',').map((d) => d.trim())\n          .filter((d) => /^\\d{4}-\\d{2}-\\d{2}$/.test(d)).slice(0, 7);\n        if (!clsQuery) return { status: 400, body: { error: 'Brak parametru class' } };\n        let cls = { name: clsQuery, short: clsQuery.split(/\\s+/)[0] };\n        const b = await store.peek('timetable');\n        if (b) { const found = findClass(listClasses(b.value.raw), clsQuery); if (found) cls = found; }\n        const dict = subjectDictionary(await dictionary(), b && b.value.raw);\n        const days = {};\n        await Promise.all(dates.map(async (date) => {\n          try {\n            const rec = await substitutionsForDate(date);\n            const v = rec.value;\n            days[date] = { entries: nameSubjects(entriesForClass(v, cls), dict), empty: v.empty, updatedAt: v.updatedAt, fetchedAt: rec.fetchedAt, stale: rec.stale, error: rec.error };\n          } catch (e) {\n            days[date] = { entries: [], error: e.message, unavailable: true };\n          }\n        }));\n        return { status: 200, body: { class: cls, days } };\n      }\n      return { status: 404, body: { error: 'Nieznany adres API' } };\n    } catch (e) {\n      log('API error', p, e.message);\n      return { status: 503, body: { error: e.message, code: e.code || null } };\n    }\n  }\n\n  return { handle, timetableBundle };\n}\n\nmodule.exports = { createApi };\n\n};\n  defs['./proxyClient'] = function (module, exports, require) {\n'use strict';\n\nconst { EduPageClient } = require('./edupage');\n\nclass ProxyEduPageClient extends EduPageClient {\n  constructor({ proxyBase = '', timeoutMs = 25000, log } = {}) {\n    super({ base: proxyBase.replace(/\\/$/, '') + '/ep', timeoutMs, log });\n    this.proxyBase = proxyBase.replace(/\\/$/, '');\n  }\n\n  async call(path, args) {\n    await this.session();\n    const sep = path.includes('?') ? '&' : '?';\n    const res = await this._fetch(this.base + path + sep + 'args=' + encodeURIComponent(JSON.stringify(args)));\n    const text = await res.text();\n    try { return JSON.parse(text); } catch (_) { throw new Error(`Pośrednik zwrócił nie-JSON dla ${path}`); }\n  }\n\n  async session(force = false) {\n    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;\n    const res = await fetch(this.proxyBase + '/ep/session' + (force ? '?refresh=1' : ''), { cache: force ? 'no-store' : 'default' });\n    let j = {};\n    try { j = await res.json(); } catch (_) { j = {}; }\n    if (!res.ok) {\n      const e = new Error(j.error || `Serwer odpowiedział ${res.status}`);\n      e.code = j.code || null;\n      throw e;\n    }\n    this.edupage = j.edupage || null;\n    this._session = { cookie: '', gsh: 'proxy', year: Number(j.year) || new Date().getFullYear(), school: j.school || null, at: Date.now() };\n    return this._session;\n  }\n}\n\nmodule.exports = { ProxyEduPageClient };\n\n};\n  var cache = {};\n  function req(name) {\n    var key = './' + name.replace(/^\\.\\//, '').replace(/\\.js$/, '');\n    if (cache[key]) return cache[key].exports;\n    if (!defs[key]) throw new Error('plan-lib: missing module ' + name);\n    var m = { exports: {} }; cache[key] = m; defs[key](m, m.exports, req); return m.exports;\n  }\n  self.PlanLib = { createApi: req('./api').createApi, ProxyEduPageClient: req('./proxyClient').ProxyEduPageClient, EduPageClient: req('./edupage').EduPageClient, normalizeEdupage: req('./edupage').normalizeEdupage };\n})();\n"},"/app.js":{"type":"text/javascript; charset=utf-8","body":"(function () {\n  'use strict';\n  const C = window.PlanCore;\n  const CFG = Object.assign({ apiBase: '' }, window.PLAN_CONFIG || {});\n  const DEMO = window.PLAN_DEMO || null;\n\n  const REFRESH_SUBST_MS = 5 * 60 * 1000;\n  const REFRESH_TT_MS = 30 * 60 * 1000;\n  const TICK_MS = 15 * 1000;\n\n  const $ = (s, r = document) => r.querySelector(s);\n  const esc = (s) => String(s == null ? '' : s).replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\n  const LS = {\n    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },\n    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },\n    del(k) { try { localStorage.removeItem(k); } catch (_) {} },\n  };\n  const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');\n  const ddmm = (iso) => iso.slice(8, 10) + '.' + iso.slice(5, 7);\n  const hash = (o) => { const s = JSON.stringify(o); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };\n  const minutesWord = (n) => (n === 1 ? 'minuta' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'minuty' : 'minut');\n  const inMinutes = (n) => (n >= 60 ? `${Math.floor(n / 60)} h ${n % 60 ? (n % 60) + ' min' : ''}`.trim() : `${n} ${minutesWord(n)}`);\n\n  const params = new URLSearchParams(location.search);\n  let simStart = null;\n  const loadedAt = Date.now();\n  const simParam = params.get('teraz') || params.get('now');\n  if (simParam) { const d = new Date(simParam); if (!isNaN(d)) simStart = d; }\n  function now() { return simStart ? new Date(simStart.getTime() + (Date.now() - loadedAt)) : new Date(); }\n  function setSim(date) { simStart = date; render(); }\n\n  const state = {\n    cls: LS.get('plan.class', null),\n    school: LS.get('plan.school', null),\n    tt: null,\n    ttMeta: { fetchedAt: null, error: null, stale: false },\n    subst: {},\n    substError: null,\n    prefs: {},\n    weekOffset: 0,\n    selected: null,\n    view: LS.get('plan.view', window.innerWidth > 900 ? 'day' : 'day'),\n    lastSync: null,\n    loading: false,\n  };\n  const prefsKey = () => 'plan.prefs.' + (state.cls ? state.cls.name : '');\n  const ttKey = () => 'plan.tt.' + (state.cls ? state.cls.name : '');\n  const substKey = () => 'plan.subst.' + (state.cls ? state.cls.name : '');\n\n  let localApi = null;\n  function browserStore() {\n    const mem = new Map(); const inflight = new Map();\n    const read = (k) => { if (mem.has(k)) return mem.get(k); const r = LS.get('plan.store.' + k, null); if (r) mem.set(k, r); return r; };\n    return {\n      peek: read,\n      async get(k, ttl, loader, opts) {\n        const cached = read(k);\n        if (!(opts && opts.force) && cached && Date.now() - cached.fetchedAt < ttl) return { ...cached, stale: false, error: null };\n        if (!inflight.has(k)) inflight.set(k, (async () => {\n          try { const rec = { value: await loader(), fetchedAt: Date.now() }; mem.set(k, rec); LS.set('plan.store.' + k, rec); return { ...rec, stale: false, error: null }; }\n          finally { inflight.delete(k); }\n        })());\n        try { return await inflight.get(k); } catch (e) { if (cached) return { ...cached, stale: true, error: e.message }; throw e; }\n      },\n    };\n  }\n  function getLocalApi() {\n    if (!localApi) {\n      const lib = window.PlanLib;\n      const client = new lib.ProxyEduPageClient({ proxyBase: CFG.apiBase || location.origin });\n      localApi = lib.createApi({ client, store: browserStore() });\n    }\n    return localApi;\n  }\n\n  async function api(path) {\n    if (DEMO) return DEMO.api(path);\n    if (CFG.mode === 'proxy' && window.PlanLib) {\n      const r = await getLocalApi().handle(new URL(path, location.origin));\n      if (r.status >= 400) throw apiError(r.body, r.status);\n      return r.body;\n    }\n    const res = await fetch(CFG.apiBase + path, { cache: 'no-store' });\n    let body = null;\n    try { body = /json/.test(res.headers.get('content-type') || '') ? await res.json() : await res.text(); } catch (_) {}\n    if (!res.ok) throw apiError(body, res.status);\n    return body;\n  }\n\n  function apiError(body, status) {\n    const e = new Error((body && body.error) || `Serwer odpowiedział ${status}`);\n    e.code = (body && body.code) || null;\n    return e;\n  }\n\n  function todayIso() { return C.isoDate(now()); }\n  function isWeekend(d) { return C.weekdayIndex(d) >= 5; }\n  function visibleWeek() {\n    const n = now();\n    return C.weekDates(n, state.weekOffset + (isWeekend(n) ? 1 : 0));\n  }\n  function nextSchoolDay(fromIso) {\n    const d = C.parseIso(fromIso);\n    do { d.setDate(d.getDate() + 1); } while (isWeekend(d));\n    return C.isoDate(d);\n  }\n\n  function dayItems(iso) {\n    if (!state.tt) return [];\n    const idx = C.weekdayIndex(C.parseIso(iso));\n    const sub = state.subst[iso];\n    return C.mergeDay(state.tt, idx, sub ? sub.entries : [], state.prefs);\n  }\n\n  async function loadTimetable(force) {\n    try {\n      const tt = await api('/api/timetable?class=' + encodeURIComponent(state.cls.name) + (force ? '&refresh=1' : ''));\n      const prev = state.tt;\n      state.tt = tt;\n      state.ttMeta = { fetchedAt: tt.fetchedAt || Date.now(), error: tt.stale ? tt.error : null, stale: !!tt.stale };\n      if (tt.class && tt.class.name && tt.class.name !== state.cls.name) {\n        state.cls = { ...state.cls, ...tt.class };\n        LS.set('plan.class', state.cls);\n      }\n      LS.set(ttKey(), { tt, savedAt: Date.now() });\n      if (prev && prev.hash && tt.hash && prev.hash !== tt.hash) toast('Plan lekcji w EduPage się zmienił. Pokazuję nową wersję.');\n      state.lastSync = Date.now();\n    } catch (e) {\n      if (e.code === 'CLASS_NOT_FOUND') {\n        const old = state.cls && state.cls.name;\n        state.cls = null; state.tt = null;\n        LS.del('plan.class');\n        toast(`W planie szkoły nie ma już klasy ${old}. Wybierz klasę.`);\n        showPicker(false);\n        return;\n      }\n      state.ttMeta = { ...state.ttMeta, error: e.message, stale: !!state.tt };\n    }\n  }\n\n  async function loadSubstitutions() {\n    const dates = [...new Set([...visibleWeek(), ...(isWeekend(now()) ? [] : [todayIso()])])];\n    try {\n      const res = await api('/api/substitutions?class=' + encodeURIComponent(state.cls.name) + '&dates=' + dates.join(','));\n      let changed = false;\n      for (const [date, d] of Object.entries(res.days || {})) {\n        const old = state.subst[date];\n        if (d.unavailable && old && !old.unavailable) { old.error = d.error; old.stale = true; continue; }\n        if (old && !old.unavailable && hash(old.entries) !== hash(d.entries) && date >= todayIso()) changed = true;\n        state.subst[date] = d;\n      }\n      state.substError = Object.values(res.days || {}).some((d) => d.unavailable) ? 'Część zastępstw jest chwilowo niedostępna.' : null;\n      const keep = {};\n      Object.keys(state.subst).sort().slice(-15).forEach((k) => { keep[k] = state.subst[k]; });\n      state.subst = keep;\n      LS.set(substKey(), keep);\n      if (changed) toast('Są nowe zmiany w zastępstwach.');\n      state.lastSync = Date.now();\n    } catch (e) {\n      state.substError = e.message;\n    }\n  }\n\n  async function refreshAll(force) {\n    if (!state.cls) return;\n    state.loading = true;\n    render();\n    await loadTimetable(force);\n    if (!state.cls) { state.loading = false; return; }\n    await loadSubstitutions();\n    state.loading = false;\n    render();\n  }\n\n  function describe(item) {\n    const eff = C.effective(item);\n    return {\n      subject: eff.subject.name || eff.subject.short,\n      teacher: eff.teachers.join(', '),\n      room: eff.rooms.join(', '),\n    };\n  }\n\n  function nowLine(items) {\n    return items.map((it) => {\n      const d = describe(it);\n      const parts = [`<strong>${esc(d.subject)}</strong>${it.groups.length ? ` <span class=\"grp\">gr. ${esc(it.groups.join(', '))}</span>` : ''}`];\n      if (d.teacher) parts.push(it.changes.teacher ? `<span class=\"chg\">${esc(d.teacher)}</span>` : esc(d.teacher));\n      if (d.room) parts.push(it.changes.room ? `<span class=\"chg\">sala ${esc(d.room)}</span>` : `sala ${esc(d.room)}`);\n      return parts.join(', ');\n    }).join('<br>');\n  }\n\n  function metaLine(it) {\n    const d = describe(it);\n    const parts = [];\n    if (d.teacher) parts.push(it.changes.teacher ? `<span class=\"chg\">${esc(d.teacher)}</span>` : esc(d.teacher));\n    if (d.room) parts.push(it.changes.room ? `<span class=\"chg\">sala ${esc(d.room)}</span>` : `sala ${esc(d.room)}`);\n    if (it.groups.length) parts.push(`grupa ${esc(it.groups.join(', '))}`);\n    return parts.join(', ');\n  }\n\n  function slotSummary(slot) {\n    const act = slot.items.filter(C.isActive);\n    return act.map((it) => {\n      const d = describe(it);\n      return `<b>${esc(d.subject)}</b>${d.room ? ', sala ' + esc(d.room) : ''}${it.groups.length ? ' (gr. ' + esc(it.groups.join(', ')) + ')' : ''}`;\n    }).join(' / ');\n  }\n\n  function renderNow() {\n    const el = $('#now');\n    if (!state.tt) { el.className = 'now'; el.innerHTML = '<p class=\"now-title\">Wczytuję plan…</p>'; return; }\n    const n = now();\n    const nowMin = n.getHours() * 60 + n.getMinutes();\n    const iso = todayIso();\n    const dateLine = `<p class=\"now-date\">${C.DAY_NAMES[C.weekdayIndex(n)]}, ${n.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}, godz. ${hhmm(n)}</p>`;\n\n    if (isWeekend(n)) {\n      el.className = 'now';\n      el.innerHTML = `${dateLine}<h2 class=\"now-title\">Weekend, dziś nie ma lekcji</h2>${firstLessonLine(nextSchoolDay(iso))}`;\n      return;\n    }\n    const rows = C.buildTimeline(dayItems(iso));\n    const st = C.nowState(rows, nowMin);\n    let title = ''; let sub = ''; let next = ''; let progress = ''; let cls = 'now';\n\n    if (st.type === 'lesson') {\n      cls += ' is-lesson';\n      const names = st.items.map((i) => describe(i).subject);\n      title = `<span class=\"lbl\">Teraz:</span> ${esc(names.join(' / '))}`;\n      sub = st.items.length === 1 ? metaLine(st.items[0]) : nowLine(st.items);\n      const pct = Math.round(Math.min(1, Math.max(0, st.progress)) * 100);\n      progress = `<div class=\"progress\"><div class=\"bar\"><span style=\"width:${pct}%\"></span></div>\n        <div class=\"progress-text\"><span>Lekcja ${st.slot.from}, ${st.slot.start}–${st.slot.end}</span><span>zostało ${inMinutes(st.minutesLeft)}</span></div></div>`;\n      if (st.next) next = `Następnie o ${st.next.start}: ${slotSummary(st.next)}`;\n    } else if (st.type === 'break') {\n      cls += ' is-break';\n      title = '<span class=\"lbl\">Teraz:</span> Przerwa';\n      sub = `Do ${st.next.start}, jeszcze ${inMinutes(st.minutesLeft)}`;\n      next = `Następnie: ${slotSummary(st.next)}`;\n    } else if (st.type === 'free') {\n      cls += ' is-break';\n      title = `<span class=\"lbl\">Teraz:</span> ${st.reason === 'cancelled' ? 'wolne (lekcja odwołana)' : 'okienko'}`;\n      sub = st.next ? `Następna lekcja o ${st.next.start}, za ${inMinutes(st.minutesLeft)}` : '';\n      if (st.next) next = `Następnie: ${slotSummary(st.next)}`;\n    } else if (st.type === 'before') {\n      title = `Lekcje zaczynają się o ${st.next.start}`;\n      sub = `Za ${inMinutes(st.minutesLeft)}`;\n      next = `Pierwsza lekcja: ${slotSummary(st.next)}`;\n    } else if (st.type === 'after') {\n      title = 'Na dzisiaj koniec lekcji';\n      next = firstLessonText(nextSchoolDay(iso));\n    } else {\n      title = 'Dziś nie masz lekcji';\n      sub = rows.length ? 'Wszystkie lekcje są odwołane albo klasa jest nieobecna.' : '';\n      next = firstLessonText(nextSchoolDay(iso));\n    }\n    el.className = cls;\n    el.innerHTML = `${dateLine}<h2 class=\"now-title\">${title}</h2>${sub ? `<p class=\"now-sub\">${sub}</p>` : ''}${progress}${next ? `<p class=\"now-next\">${next}</p>` : ''}`;\n  }\n\n  function firstLessonText(iso) {\n    const rows = C.buildTimeline(dayItems(iso));\n    const first = rows.find((r) => r.type === 'slot' && r.active);\n    const d = C.parseIso(iso);\n    const tomorrow = C.isoDate(new Date(now().getTime() + 86400000)) === iso;\n    const name = tomorrow ? 'Jutro' : `W ${['poniedziałek', 'wtorek', 'środę', 'czwartek', 'piątek'][C.weekdayIndex(d)] || ''}`;\n    return first ? `${name} pierwsza lekcja o <b>${first.start}</b>: ${slotSummary(first)}` : `${name} nie ma lekcji w planie.`;\n  }\n\n  function firstLessonLine(iso) { return `<p class=\"now-next\">${firstLessonText(iso)}</p>`; }\n\n  function renderBanner() {\n    const el = $('#banner');\n    const msgs = [];\n    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;\n    const savedAt = state.ttMeta.fetchedAt ? hhmm(new Date(state.ttMeta.fetchedAt)) : null;\n    const savedDay = state.ttMeta.fetchedAt ? new Date(state.ttMeta.fetchedAt).toLocaleDateString('pl-PL') : '';\n    if (offline) msgs.push(['bad', `Brak internetu. Pokazuję plan zapisany ${savedDay} o ${savedAt || '—'}. Odświeżę, gdy połączenie wróci.`]);\n    else if (state.ttMeta.error && state.tt) msgs.push(['', `Nie udało się teraz pobrać planu z EduPage (${esc(state.ttMeta.error)}). Pokazuję ostatnio zapisaną wersję z ${savedDay}, ${savedAt}. Ponowię próbę za kilka minut.`]);\n    if (!offline && state.substError) msgs.push(['', `Zastępstwa: ${esc(state.substError)} Pokazuję ostatnio pobrane informacje.`]);\n    el.innerHTML = msgs.map(([k, t]) => `<div class=\"notice ${k}\"><p>${t}</p><button class=\"btn\" type=\"button\" data-act=\"retry\">Spróbuj teraz</button></div>`).join('');\n  }\n\n  function renderTabs() {\n    const week = visibleWeek();\n    if (!state.selected || !week.includes(state.selected)) state.selected = week.includes(todayIso()) ? todayIso() : week[0];\n    $('#dayTabs').innerHTML = week.map((iso, i) => {\n      const sub = state.subst[iso];\n      const hasChanges = sub && sub.entries && sub.entries.length && dayItems(iso).some((l) => l.status !== 'normal');\n      const isToday = iso === todayIso();\n      const tag = isToday ? '<span class=\"tag today-tag\">dzisiaj</span>' : hasChanges ? '<span class=\"tag chg-tag\">zmiany</span>' : '<span class=\"tag\"></span>';\n      return `<button class=\"day-tab${isToday ? ' today' : ''}\" role=\"tab\" type=\"button\" data-date=\"${iso}\" aria-selected=\"${iso === state.selected}\">\n        <span class=\"d\">${C.DAY_SHORT[i]}</span><span class=\"n\">${ddmm(iso)}</span>${tag}</button>`;\n    }).join('');\n    document.querySelectorAll('.switch-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));\n    const d = C.parseIso(state.selected);\n    const isToday = state.selected === todayIso();\n    $('#dayTitle').innerHTML = state.view === 'week'\n      ? `Tydzień ${ddmm(week[0])}–${ddmm(week[4])}`\n      : `${C.DAY_NAMES[C.weekdayIndex(d)]}<span class=\"date\">${d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}${isToday ? ', dzisiaj' : ''}</span>`;\n  }\n\n  function changeCells(it) {\n    const subj = it.changes.subject\n      ? `<s>${esc(it.changes.subject.from.name)}</s><span class=\"arrow\">→</span><span class=\"subj\">${esc(it.changes.subject.to.name || it.changes.subject.to.short)}</span>`\n      : `<span class=\"subj\">${esc(it.subject.name)}</span>`;\n    const teacher = it.changes.teacher\n      ? `${it.changes.teacher.from.length ? `<s>${esc(it.changes.teacher.from.join(', '))}</s><span class=\"arrow\">→</span>` : ''}<span class=\"to\">${esc(it.changes.teacher.to.join(', '))}</span>`\n      : esc(it.teachers.join(', '));\n    const room = it.changes.room\n      ? `<span class=\"room-lbl\">Sala </span>${it.changes.room.from ? `<s>${esc(it.changes.room.from)}</s><span class=\"arrow\">→</span>` : ''}<span class=\"to\">${esc(it.changes.room.to)}</span>`\n      : (it.rooms.length ? `<span class=\"room-lbl\">Sala </span>${esc(it.rooms.join(', '))}` : '');\n    return { subj, teacher, room };\n  }\n\n  function changeLabel(it) {\n    if (it.changes.teacher) return 'Zastępstwo';\n    if (it.changes.subject) return 'Zmiana przedmiotu';\n    if (it.changes.room) return 'Zmiana sali';\n    return 'Zmiana';\n  }\n\n  function badges(it, isNow) {\n    const b = [];\n    if (isNow) b.push('<span class=\"label live\">Teraz</span>');\n    if (it.status === 'cancelled') b.push('<span class=\"label cancel\">ODWOŁANA</span>');\n    else if (it.status === 'absent') b.push('<span class=\"label absent\">Klasa nieobecna</span>');\n    else if (it.status === 'added') b.push('<span class=\"label added\">Dodatkowa</span>');\n    else if (it.status === 'changed') b.push(`<span class=\"label\">${changeLabel(it)}</span>`);\n    return b.join('');\n  }\n\n  function renderDay() {\n    const iso = state.selected;\n    const items = dayItems(iso);\n    const rows = C.buildTimeline(items);\n    const isToday = iso === todayIso();\n    const n = now();\n    const nowMin = n.getHours() * 60 + n.getMinutes();\n    const st = isToday ? C.nowState(rows, nowMin) : { type: 'none' };\n    if (!items.length) {\n      return `<div class=\"empty\"><strong>Brak lekcji</strong>${state.tt ? 'W planie nie ma lekcji na ten dzień.' : 'Plan jeszcze się nie wczytał.'}</div>`;\n    }\n    let html = `<table class=\"day\"><thead><tr><th class=\"c-num\">Nr</th><th>Godziny</th><th>Przedmiot</th><th>Nauczyciel</th><th>Sala</th><th>Zmiany</th><th><span class=\"sr-only\">Szczegóły</span></th></tr></thead><tbody>`;\n    for (const r of rows) {\n      if (r.type !== 'slot') {\n        const isNowGap = isToday && st.key === r.key;\n        const label = r.type === 'break' ? `Przerwa, ${r.minutes} min` : `Okienko (${r.periods > 1 ? r.periods + ' lekcje' : '1 lekcja'})`;\n        html += `<tr class=\"gap ${r.type}${isNowGap ? ' is-now' : ''}\"><td colspan=\"7\"><div class=\"gap-in\"><span class=\"gap-time\">${r.start}–${r.end}</span><span>${isNowGap ? 'Teraz: ' : ''}${label}</span></div></td></tr>`;\n        continue;\n      }\n      r.items.forEach((it, i) => {\n        const isNow = isToday && st.type === 'lesson' && st.key === r.key && C.isActive(it);\n        const past = isToday && C.toMin(r.end) <= nowMin;\n        const c = changeCells(it);\n        const k = ['lesson', 'st-' + it.status];\n        if (isNow) k.push('is-now');\n        if (past) k.push('is-past');\n        if (i > 0) k.push('same-slot');\n        if (i < r.items.length - 1) k.push('has-next');\n        const num = it.from === it.to ? it.from : `${it.from}–${it.to}`;\n        const notes = it.notes.filter((x) => !/^nieobecno/i.test(x)).map((x) => `<span class=\"note\">${esc(x)}</span>`).join('');\n        html += `<tr class=\"${k.join(' ')}\">\n          <td class=\"c-num\">${i > 0 ? '' : num}</td>\n          <td class=\"c-time\"><span class=\"t1\">${it.start}</span><span class=\"sep\">–</span><span class=\"t2\">${it.end}</span><span class=\"mnum\">lekcja ${num}</span></td>\n          <td class=\"c-subj\">${c.subj}${it.groups.length ? `<span class=\"grp\">gr. ${esc(it.groups.join(', '))}</span>` : ''}${notes}</td>\n          <td class=\"c-teacher\">${c.teacher}</td>\n          <td class=\"c-room\">${c.room}</td>\n          <td class=\"c-info\">${badges(it, isNow)}</td>\n          <td class=\"c-more\"><button class=\"info-btn\" type=\"button\" data-detail=\"${esc(iso)}|${esc(it.id)}\" aria-label=\"Szczegóły: ${esc(it.subject.name)}, lekcja ${num}\">?</button></td>\n        </tr>`;\n      });\n    }\n    return html + '</tbody></table>';\n  }\n\n  function renderWeek() {\n    const week = visibleWeek();\n    const today = todayIso();\n    const perDay = week.map((iso) => dayItems(iso));\n    const used = perDay.flat();\n    if (!used.length) return '<div class=\"empty\"><strong>Brak lekcji</strong>W tym tygodniu plan jest pusty.</div>';\n    const minP = Math.min(...used.map((l) => l.from));\n    const maxP = Math.max(...used.map((l) => l.to));\n    const periods = state.tt.periods.filter((p) => p.n >= minP && p.n <= maxP);\n    const n = now(); const nowMin = n.getHours() * 60 + n.getMinutes();\n    const todaySt = week.includes(today) ? C.nowState(C.buildTimeline(perDay[week.indexOf(today)]), nowMin) : null;\n\n    let html = `<div class=\"week-wrap\"><table class=\"week\"><thead><tr><th class=\"pcol\">Lekcja</th>`;\n    week.forEach((iso, i) => { html += `<th class=\"${iso === today ? 'today' : ''}\">${C.DAY_NAMES[i]}<br><span style=\"font-weight:400\">${ddmm(iso)}</span></th>`; });\n    html += '</tr></thead><tbody>';\n    for (const p of periods) {\n      html += `<tr><th class=\"pcol\"><b>${p.n}</b>${p.start}</th>`;\n      week.forEach((iso, i) => {\n        const items = perDay[i].filter((l) => l.from === p.n);\n        const cont = perDay[i].some((l) => l.from < p.n && l.to >= p.n);\n        const cells = items.map((it) => {\n          const eff = C.effective(it);\n          const isNow = iso === today && todaySt && todaySt.type === 'lesson' && todaySt.items.includes(it);\n          return `<button type=\"button\" class=\"wcell st-${it.status}${isNow ? ' is-now' : ''}\" data-detail=\"${esc(iso)}|${esc(it.id)}\">\n            <b>${esc(eff.subject.name || eff.subject.short)}</b><span>${esc(eff.rooms.join(', ') || '')}${it.groups.length ? `, gr. ${esc(it.groups.join(', '))}` : ''}</span></button>`;\n        }).join('');\n        html += `<td class=\"${iso === today ? 'today' : 'other'}\">${cells || (cont ? '<span class=\"sr-only\">ciąg dalszy</span>' : '')}</td>`;\n      });\n      html += '</tr>';\n    }\n    return html + '</tbody></table></div>';\n  }\n\n  function renderGroupPrompt() {\n    const el = $('#groupPrompt');\n    if (!state.tt || state.prefs.asked) { el.innerHTML = ''; return; }\n    const div = (state.tt.divisions || []).find((d) => d.groups.length > 1);\n    if (!div) { el.innerHTML = ''; return; }\n    el.innerHTML = `<div class=\"notice info\"><p>Klasa jest podzielona na grupy ${div.groups.map(esc).join(' i ')}. Wybierz swoją, żeby widzieć tylko swoje lekcje.</p>\n      <div class=\"btns\">${div.groups.map((g) => `<button class=\"btn\" type=\"button\" data-group=\"${esc(div.id)}|${esc(g)}\">Grupa ${esc(g)}</button>`).join('')}\n      <button class=\"btn\" type=\"button\" data-group=\"${esc(div.id)}|*\">Pokazuj obie</button></div></div>`;\n  }\n\n  function renderFoot() {\n    const parts = [];\n    if (state.loading) parts.push('<span>Pobieram dane z EduPage…</span>');\n    else if (state.lastSync) parts.push(`<span${state.ttMeta.error || state.substError ? ' class=\"warn\"' : ''}>Ostatnia aktualizacja: ${hhmm(new Date(state.lastSync))}</span>`);\n    else if (state.ttMeta.fetchedAt) parts.push(`<span class=\"warn\">Dane zapisane ${new Date(state.ttMeta.fetchedAt).toLocaleString('pl-PL')}</span>`);\n    parts.push('<button class=\"link-btn\" type=\"button\" data-act=\"retry\">Odśwież</button>');\n    if (state.tt && state.tt.timetable) parts.push(`<span>Plan: ${esc(state.tt.timetable)}</span>`);\n    const sch = state.school;\n    if (sch && sch.edupage) parts.push(`<span>Dane: <a href=\"https://${esc(sch.edupage)}.edupage.org/timetable/\" target=\"_blank\" rel=\"noopener\">EduPage${sch.name ? ' ' + esc(sch.name) : ''}</a></span>`);\n    parts.push('<span>Strona nieoficjalna, nie jest prowadzona przez szkołę.</span>');\n    parts.push('<span>Autor: <a href=\"https://github.com/xmoviesmovies103-hash/plan-lekcji\" target=\"_blank\" rel=\"noopener\">Kacper Studio</a></span>');\n    $('#foot').innerHTML = parts.join('');\n  }\n\n  function render() {\n    if (!state.cls) return;\n    $('#classBtn').innerHTML = `<span class=\"cls-lbl\">Klasa: </span><b>${esc(state.cls.short || state.cls.name)}</b>`;\n    $('#classBtn').setAttribute('aria-label', `Klasa ${state.cls.name}. Zmień klasę`);\n    $('#headNav').hidden = false;\n    renderInstallHint();\n    renderNow();\n    renderPushCard();\n    renderBanner();\n    renderTabs();\n    renderGroupPrompt();\n    const plan = $('#plan');\n    if (!state.tt) {\n      plan.innerHTML = state.ttMeta.error\n        ? `<div class=\"empty\"><strong>Nie udało się pobrać planu</strong>${esc(state.ttMeta.error)}<br><br><button class=\"btn primary\" type=\"button\" data-act=\"retry\">Spróbuj ponownie</button></div>`\n        : '<div class=\"empty\"><strong>Wczytuję plan z EduPage…</strong>To potrwa kilka sekund.</div>';\n    } else {\n      const wrapOld = plan.querySelector('.week-wrap');\n      const keepScroll = wrapOld ? wrapOld.scrollLeft : null;\n      plan.innerHTML = state.view === 'week' ? renderWeek() : renderDay();\n      const wrap = plan.querySelector('.week-wrap');\n      if (wrap && wrap.scrollWidth > wrap.clientWidth) {\n        const th = wrap.querySelector('thead th.today');\n        const pcol = wrap.querySelector('th.pcol');\n        if (keepScroll != null) wrap.scrollLeft = keepScroll;\n        else if (th) wrap.scrollLeft = th.offsetLeft - (pcol ? pcol.offsetWidth : 0);\n      }\n    }\n    renderFoot();\n  }\n\n  function openDetail(iso, id) {\n    const it = dayItems(iso).find((x) => String(x.id) === id);\n    if (!it) return;\n    const c = changeCells(it);\n    const d = C.parseIso(iso);\n    const num = it.from === it.to ? it.from : `${it.from}–${it.to}`;\n    const status = { normal: 'Zgodnie z planem', changed: changeLabel(it), cancelled: 'Odwołana', added: 'Dodatkowa lekcja (spoza planu)', absent: 'Klasa nieobecna' }[it.status];\n    const raws = it.sources.map((s) => s.raw).filter(Boolean);\n    const dlg = $('#detail');\n    dlg.innerHTML = `\n      <div class=\"dlg-head\"><h2 id=\"detailTitle\">${esc(C.effective(it).subject.name)}<span class=\"sub\">${C.DAY_NAMES[C.weekdayIndex(d)]}, ${ddmm(iso)}, lekcja ${num}</span></h2>\n        <button class=\"close-btn\" type=\"button\" data-close>Zamknij</button></div>\n      <div class=\"dlg-body\">\n        <dl class=\"facts\">\n          <dt>Godziny</dt><dd>${it.start}–${it.end}</dd>\n          <dt>Przedmiot</dt><dd>${c.subj}${it.subject.short && it.subject.short !== it.subject.name ? ` <span style=\"color:var(--muted)\">(${esc(it.subject.short)})</span>` : ''}</dd>\n          <dt>Nauczyciel</dt><dd>${c.teacher || '—'}</dd>\n          <dt>Sala</dt><dd>${c.room.replace(/<span class=\"room-lbl\">Sala <\\/span>/, '') || '—'}</dd>\n          ${it.groups.length ? `<dt>Grupa</dt><dd>${esc(it.groups.join(', '))}</dd>` : ''}\n          <dt>Status</dt><dd>${it.status === 'cancelled' ? badges(it, false) : esc(status)}</dd>\n          ${it.notes.length ? `<dt>Uwagi</dt><dd>${it.notes.map(esc).join('<br>')}</dd>` : ''}\n          ${it.weeks ? `<dt>Tygodnie</dt><dd>Nie co tydzień (wzór ${esc(it.weeks)})</dd>` : ''}\n        </dl>\n        ${raws.length ? `<div class=\"raw\"><b>Wpis w zastępstwach EduPage:</b><br>${raws.map(esc).join('<br>')}</div>` : ''}\n      </div>`;\n    dlg.showModal();\n  }\n\n  function openSettings() {\n    const dlg = $('#settings');\n    const divs = (state.tt && state.tt.divisions) || [];\n    const sel = state.prefs.groups || {};\n    const groupFields = divs.map((dv) => {\n      if (dv.groups.length > 1) {\n        return `<div class=\"field\"><label for=\"g-${esc(dv.id)}\">Grupa (${dv.groups.map(esc).join(' / ')})</label>\n          <select id=\"g-${esc(dv.id)}\" data-div=\"${esc(dv.id)}\"><option value=\"*\">Pokazuj wszystkie grupy</option>\n          ${dv.groups.map((g) => `<option value=\"${esc(g)}\"${sel[dv.id] === g ? ' selected' : ''}>Tylko grupa ${esc(g)}</option>`).join('')}</select></div>`;\n      }\n      const g = dv.groups[0];\n      return `<div class=\"field\"><label for=\"g-${esc(dv.id)}\">Zajęcia w grupie „${esc(g)}”${/^rel/i.test(g) ? ' (religia)' : ''}</label>\n        <select id=\"g-${esc(dv.id)}\" data-div=\"${esc(dv.id)}\"><option value=\"*\">Pokazuj</option><option value=\"none\"${sel[dv.id] === 'none' ? ' selected' : ''}>Nie chodzę, ukryj</option></select></div>`;\n    }).join('');\n    dlg.innerHTML = `\n      <div class=\"dlg-head\"><h2 id=\"settingsTitle\">Ustawienia</h2><button class=\"close-btn\" type=\"button\" data-close>Zamknij</button></div>\n      <div class=\"dlg-body\">\n        <div class=\"field\"><span class=\"lbl\">Szkoła</span>\n          <div class=\"row-between\"><span>${esc((state.school && (state.school.name || state.school.edupage + '.edupage.org')) || 'nieustawiona')}</span>${CFG.mode === 'proxy' ? '' : '<button class=\"btn\" type=\"button\" data-act=\"change-school\">Zmień szkołę</button>'}</div>\n          ${CFG.mode === 'proxy' ? '<p class=\"hint\">Szkołę zmienia właściciel strony w Cloudflare (zmienna EDUPAGE).</p>' : ''}</div>\n        <div class=\"field\"><span class=\"lbl\">Klasa</span>\n          <div class=\"row-between\"><span>${esc(state.cls.name)}</span><button class=\"btn\" type=\"button\" data-act=\"change-class\">Zmień klasę</button></div></div>\n        ${groupFields || '<p class=\"hint\">Twoja klasa nie jest dzielona na grupy.</p>'}\n        <div class=\"field\"><label for=\"defView\">Widok po otwarciu</label>\n          <select id=\"defView\"><option value=\"day\"${state.view === 'day' ? ' selected' : ''}>Dzień</option><option value=\"week\"${state.view === 'week' ? ' selected' : ''}>Tydzień</option></select></div>\n        ${pushSettingsHtml()}\n        <div class=\"field\"><span class=\"lbl\">Połączenie z EduPage</span>\n          <button class=\"btn\" type=\"button\" data-act=\"check\">Sprawdź połączenie</button>\n          <pre class=\"check-out\" id=\"checkOut\" hidden></pre></div>\n        <div class=\"field\"><span class=\"lbl\">Na iPhonie jak aplikacja</span>\n          <ol class=\"steps hint\"><li>Otwórz tę stronę w Safari.</li><li>Stuknij przycisk Udostępnij (kwadrat ze strzałką).</li><li>Wybierz „Do ekranu początkowego” i „Dodaj”.</li></ol></div>\n        <div class=\"field\"><span class=\"lbl\">Dane na tym urządzeniu</span>\n          <div class=\"hint\">Plan i zastępstwa są zapisywane w przeglądarce, żeby działały bez internetu.</div>\n          <button class=\"link-btn\" type=\"button\" data-act=\"reset\" style=\"margin-top:8px\">Usuń zapisane dane i wybierz klasę od nowa</button></div>\n      </div>`;\n    dlg.showModal();\n  }\n\n  const YEAR_NAMES = { 1: 'Klasy pierwsze', 2: 'Klasy drugie', 3: 'Klasy trzecie', 4: 'Klasy czwarte', 5: 'Klasy piąte' };\n  let classList = [];\n\n  async function showPicker(canCancel) {\n    $('#app').hidden = true;\n    $('#setup').hidden = true;\n    $('#headNav').hidden = true;\n    $('#picker').hidden = false;\n    applySchool();\n    $('#pickerCancel').hidden = !canCancel;\n    const listEl = $('#classList');\n    classList = LS.get('plan.classes', []);\n    drawClasses();\n    if (!classList.length) listEl.innerHTML = '<p class=\"msg\">Pobieram listę klas z EduPage…</p>';\n    try {\n      const res = await api('/api/classes');\n      classList = res.classes || [];\n      LS.set('plan.classes', classList);\n    } catch (e) {\n      if (e.code === 'NOT_CONFIGURED') { showSetup(); return; }\n      if (!classList.length) {\n        listEl.innerHTML = `<p class=\"msg\">Nie udało się pobrać listy klas (${esc(e.message)}).</p><button class=\"btn\" type=\"button\" data-act=\"picker-retry\">Spróbuj ponownie</button>`;\n        return;\n      }\n    }\n    drawClasses();\n    $('#classSearch').focus();\n  }\n\n  function drawClasses(msg) {\n    const q = ($('#classSearch').value || '').toLowerCase().replace(/\\s+/g, '');\n    const list = classList.filter((c) => !q || (c.name + c.short).toLowerCase().replace(/\\s+/g, '').includes(q));\n    const groups = {};\n    list.forEach((c) => { const y = /^(\\d)/.exec(c.name); const key = y ? y[1] : 'x'; (groups[key] = groups[key] || []).push(c); });\n    let html = msg ? `<p class=\"msg\">${msg}</p>` : '';\n    Object.keys(groups).sort().forEach((y) => {\n      html += `<div class=\"class-group\"><h2>${YEAR_NAMES[y] || 'Pozostałe'}</h2><div class=\"class-grid\">`;\n      html += groups[y].map((c) => {\n        const rest = c.name.slice(c.short.length).trim();\n        const k = ['class-opt'];\n        if (state.cls && state.cls.name === c.name) k.push('current');\n        return `<button class=\"${k.join(' ')}\" type=\"button\" data-class=\"${esc(c.name)}\"><b>${esc(c.short || c.name)}</b>${rest ? `<span>${esc(rest)}</span>` : ''}</button>`;\n      }).join('');\n      html += '</div></div>';\n    });\n    if (!list.length && !msg) html = '<p class=\"msg\">Nie ma takiej klasy. Sprawdź pisownię.</p>';\n    $('#classList').innerHTML = html;\n  }\n\n  function chooseClass(name) {\n    const c = classList.find((x) => x.name === name) || { id: null, name, short: name.split(/\\s+/)[0] };\n    const changed = !state.cls || state.cls.name !== c.name;\n    state.cls = c;\n    LS.set('plan.class', c);\n    if (changed) {\n      state.tt = null; state.subst = {}; state.ttMeta = { fetchedAt: null, error: null, stale: false };\n      restoreCache();\n    }\n    $('#picker').hidden = true;\n    $('#app').hidden = false;\n    render();\n    refreshAll().then(() => { if (changed) syncPush(); });\n  }\n\n  function restoreCache() {\n    state.prefs = LS.get(prefsKey(), {});\n    const cached = LS.get(ttKey(), null);\n    if (cached && cached.tt) { state.tt = cached.tt; state.ttMeta = { fetchedAt: cached.tt.fetchedAt || cached.savedAt, error: null, stale: true }; }\n    state.subst = LS.get(substKey(), {});\n  }\n\n  const push = { checked: false, key: null, off: null };\n  const pushInfo = () => LS.get('plan.push', null);\n  function isIos() { const ua = navigator.userAgent || ''; return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }\n  function isStandalone() { return window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }\n\n  function pushSupport() {\n    if (isIos() && !isStandalone()) return 'ios-home';\n    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';\n    return 'ok';\n  }\n  async function pushServer() {\n    if (push.checked) return !!push.key;\n    push.checked = true;\n    if (DEMO) { push.key = 'demo'; return true; }\n    try {\n      const r = await fetch((CFG.apiBase || '') + 'push/key', { cache: 'no-store' });\n      const j = await r.json();\n      if (r.ok && j.key) push.key = j.key; else push.off = j.error || 'off';\n    } catch (_) { push.off = 'off'; }\n    render();\n    return !!push.key;\n  }\n  function pushExclude() {\n    const out = [];\n    const sel = state.prefs.groups || {};\n    for (const d of (state.tt && state.tt.divisions) || []) {\n      const c = sel[d.id];\n      if (c === 'none') out.push(...d.groups);\n      else if (c && c !== '*') out.push(...d.groups.filter((g) => g !== c));\n    }\n    return out;\n  }\n  function b64ToBytes(b64) {\n    const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4));\n    return Uint8Array.from(s, (c) => c.charCodeAt(0));\n  }\n  async function postJson(path, body) {\n    const r = await fetch((CFG.apiBase || '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });\n    const j = await r.json().catch(() => ({}));\n    if (!r.ok) throw new Error(j.error || `Błąd ${r.status}`);\n    return j;\n  }\n  async function enablePush() {\n    if (DEMO) { toast('W podglądzie powiadomienia są wyłączone.'); return; }\n    if (!(await pushServer())) throw new Error('Powiadomienia nie są jeszcze włączone na serwerze.');\n    const perm = await Notification.requestPermission();\n    if (perm !== 'granted') throw new Error('Nie zezwolono na powiadomienia. Możesz to zmienić w ustawieniach telefonu lub przeglądarki.');\n    const reg = await navigator.serviceWorker.ready;\n    let sub = await reg.pushManager.getSubscription();\n    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(push.key) });\n    const prev = pushInfo();\n    const r = await postJson('push/subscribe', { endpoint: sub.endpoint, cls: { name: state.cls.name, short: state.cls.short || state.cls.name.split(/\\s+/)[0] }, exclude: pushExclude(), prevKey: prev && prev.key });\n    LS.set('plan.push', { id: r.id, key: r.key, msgKey: r.msgKey, cls: state.cls.name });\n    try { await (await caches.open('plan-push')).put('config', new Response(JSON.stringify({ id: r.id, msgKey: r.msgKey }))); } catch (_) {}\n  }\n  async function disablePush() {\n    const info = pushInfo();\n    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (_) {}\n    if (info) await postJson('push/unsubscribe', { key: info.key }).catch(() => {});\n    LS.del('plan.push');\n    try { await caches.delete('plan-push'); } catch (_) {}\n  }\n\n  function syncPush() {\n    if (pushInfo() && 'Notification' in window && Notification.permission === 'granted') enablePush().catch(() => {});\n  }\n\n  const PUSH_WHY = (cls) => `Dostaniesz powiadomienie, gdy w EduPage pojawi się zastępstwo, odwołana lekcja albo zmiana sali w klasie ${esc(cls)}.\n    Zmiany na jutro przychodzą zwykle po południu i wieczorem, a na dziś rano, więc nie musisz sprawdzać planu przed wyjściem z domu.\n    Plan sprawdzamy co 5 minut; między 22:00 a 6:00 nic nie wysyłamy.`;\n  const PUSH_PRIVACY = 'Nie podajesz imienia ani numeru telefonu. Zapisujemy tylko anonimowy adres powiadomień tego urządzenia, klasę i grupę.';\n  const PUSH_IOS = 'Na iPhonie powiadomienia działają, gdy plan jest dodany do ekranu początkowego (Udostępnij → Do ekranu początkowego). Potem otwórz plan z ikony na ekranie i włącz je tutaj. Potrzebny jest iOS 16.4 lub nowszy.';\n\n  function renderPushCard() {\n    const el = $('#pushCard');\n    if (!el) return;\n    const sup = pushSupport();\n    if (!push.key || pushInfo() || LS.get('plan.pushCard', '') === 'hidden' || sup === 'unsupported' || !state.tt) { el.innerHTML = ''; return; }\n    const cls = state.cls.short || state.cls.name;\n    const groupNote = (state.tt.divisions || []).some((d) => d.groups.length > 1) && !state.prefs.asked\n      ? '<p class=\"hint\">Najpierw wybierz swoją grupę, żeby nie dostawać zmian drugiej grupy.</p>' : '';\n    el.innerHTML = `<div class=\"notice info push-card\"><div class=\"push-text\"><b>Powiadomienia o zmianach w planie</b>\n      <p>${PUSH_WHY(cls)}</p>${sup === 'ios-home' ? `<p>${PUSH_IOS}</p>` : ''}${groupNote}<p class=\"hint\">${PUSH_PRIVACY}</p></div>\n      <div class=\"btns\">${sup === 'ok' ? '<button class=\"btn primary\" type=\"button\" data-act=\"push-on\">Włącz powiadomienia</button>' : ''}\n      <button class=\"btn\" type=\"button\" data-act=\"push-later\">Nie teraz</button></div></div>`;\n  }\n\n  function pushSettingsHtml() {\n    const sup = pushSupport();\n    const info = pushInfo();\n    const cls = state.cls.short || state.cls.name;\n    let body;\n    if (push.off || (!push.key && push.checked)) body = '<p class=\"hint\">Powiadomienia działają w wersji strony na Cloudflare, po dodaniu bazy PUSH (instrukcja w README).</p>';\n    else if (!push.checked) body = '<p class=\"hint\">Sprawdzam…</p>';\n    else if (sup === 'ios-home') body = `<p class=\"hint\">${PUSH_IOS}</p>`;\n    else if (sup === 'unsupported') body = '<p class=\"hint\">Ta przeglądarka nie obsługuje powiadomień ze stron. Spróbuj w Chrome, Edge albo Safari na iPhonie (iOS 16.4+).</p>';\n    else if (info) body = `<p>Włączone dla klasy ${esc(info.cls)}${pushExclude().length ? ` (bez grup: ${esc(pushExclude().join(', '))})` : ''}.</p>\n      <div class=\"btns\"><button class=\"btn\" type=\"button\" data-act=\"push-test\">Wyślij próbne</button><button class=\"btn\" type=\"button\" data-act=\"push-off\">Wyłącz</button></div>`;\n    else body = `<div class=\"btns\"><button class=\"btn primary\" type=\"button\" data-act=\"push-on\">Włącz powiadomienia</button></div>`;\n    return `<div class=\"field\"><span class=\"lbl\">Powiadomienia o zmianach</span>\n      <p class=\"hint\">${PUSH_WHY(cls)}</p>${body}<p class=\"hint\">${PUSH_PRIVACY}</p></div>`;\n  }\n\n  async function pushAction(act) {\n    try {\n      if (act === 'push-on') { await enablePush(); toast(`Powiadomienia włączone dla ${state.cls.short || state.cls.name}.`); }\n      if (act === 'push-off') { await disablePush(); toast('Powiadomienia wyłączone.'); }\n      if (act === 'push-test') { const info = pushInfo(); const r = await postJson('push/test', { key: info.key }); toast(r.ok ? 'Wysłano próbne powiadomienie.' : 'Serwer powiadomień odrzucił próbę. Wyłącz i włącz je ponownie.'); }\n    } catch (e) { toast(e.message); }\n    render();\n    if ($('#settings').open) openSettings();\n  }\n\n  function applySchool() {\n    const sch = state.school;\n    const name = sch && sch.name;\n    $('#schoolName').textContent = name || '';\n    $('#schoolName').hidden = !name;\n    $('#pickerSchool').textContent = name ? name : '';\n    $('#pickerSchool').hidden = !name;\n    document.title = name ? `Plan lekcji · ${name}` : 'Plan lekcji';\n  }\n\n  function forgetSchoolData() {\n    try { Object.keys(localStorage).filter((k) => k.startsWith('plan.') && k !== 'plan.view').forEach((k) => LS.del(k)); } catch (_) {}\n    localApi = null;\n    state.cls = null; state.tt = null; state.subst = {}; state.prefs = {};\n  }\n\n  async function loadSchool() {\n    const r = await api('/api/school');\n    const prev = state.school;\n    if (prev && prev.edupage && r.edupage && prev.edupage !== r.edupage) forgetSchoolData();\n    state.school = { name: r.name || null, edupage: r.edupage || null };\n    LS.set('plan.school', state.school);\n    applySchool();\n    return state.school;\n  }\n\n  function showSetup(canCancel) {\n    $('#app').hidden = true;\n    $('#picker').hidden = true;\n    $('#headNav').hidden = true;\n    $('#setup').hidden = false;\n    $('#setupCancel').hidden = !canCancel;\n    const proxy = CFG.mode === 'proxy';\n    $('#setupSave').hidden = proxy;\n    $('#setupLead').textContent = proxy\n      ? 'Ta strona nie ma jeszcze ustawionej szkoły. Wpisz adres EduPage szkoły, a pokażemy, co ustawić w Cloudflare.'\n      : 'Wpisz adres EduPage swojej szkoły. Strona sprawdzi go i zapamięta.';\n    updateSetupHelp();\n    $('#setupInput').focus();\n  }\n\n  function hideSetup() {\n    $('#setup').hidden = true;\n    if (state.cls) { $('#app').hidden = false; $('#headNav').hidden = false; render(); } else showPicker(false);\n  }\n\n  function normalizeAddress(v) {\n    let s = String(v || '').trim().toLowerCase().replace(/^[a-z]+:\\/\\//, '').split(/[/?#]/)[0].replace(/:\\d+$/, '').replace(/\\.edupage\\.org$/, '');\n    return /^[a-z0-9][a-z0-9-]{0,62}$/.test(s) ? s : null;\n  }\n\n  let probeTimer = null;\n  function updateSetupHelp() {\n    const raw = $('#setupInput').value;\n    const id = normalizeAddress(raw);\n    const out = $('#setupHelp');\n    if (!raw.trim()) { out.innerHTML = ''; return; }\n    if (!id) { out.innerHTML = '<p class=\"msg\">To nie wygląda na adres EduPage. Przykład: <b>mojaszkola.edupage.org</b></p>'; return; }\n    if (CFG.mode !== 'proxy') { out.innerHTML = `<p class=\"msg\">Adres: <b>${esc(id)}.edupage.org</b></p>`; return; }\n    out.innerHTML = `<p class=\"msg\">Adres: <b>${esc(id)}.edupage.org</b> <span id=\"probeResult\"></span></p>\n      <ol class=\"steps\">\n        <li>Otwórz <b>dash.cloudflare.com</b> → <b>Workers &amp; Pages</b> → ten Worker → <b>Settings</b>.</li>\n        <li>W części <b>Variables and Secrets</b> kliknij <b>Add</b>.</li>\n        <li>Type: <b>Text</b>, Variable name: <b>EDUPAGE</b>, Value: <b>${esc(id)}</b>.</li>\n        <li>Kliknij <b>Deploy</b>, a potem odśwież tę stronę.</li>\n      </ol>`;\n    clearTimeout(probeTimer);\n    probeTimer = setTimeout(async () => {\n      const el = $('#probeResult');\n      if (!el) return;\n      el.textContent = 'sprawdzam…';\n      try {\n        const r = await fetch((CFG.apiBase || '') + '/ep/probe?edupage=' + encodeURIComponent(id), { cache: 'no-store' });\n        const j = await r.json();\n        if (!$('#probeResult')) return;\n        $('#probeResult').textContent = r.ok ? `✓ znaleziono${j.school ? ': ' + j.school : ''}` : `✗ ${j.error || 'nie znaleziono'}`;\n      } catch (_) { if ($('#probeResult')) $('#probeResult').textContent = ''; }\n    }, 500);\n  }\n\n  async function saveSetup() {\n    const id = normalizeAddress($('#setupInput').value);\n    const out = $('#setupHelp');\n    if (!id) { out.innerHTML = '<p class=\"msg\">To nie wygląda na adres EduPage. Przykład: <b>mojaszkola.edupage.org</b></p>'; return; }\n    $('#setupSave').disabled = true;\n    out.innerHTML = `<p class=\"msg\">Sprawdzam ${esc(id)}.edupage.org…</p>`;\n    try {\n      const r = await fetch((CFG.apiBase || '') + '/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edupage: id }) });\n      const j = await r.json().catch(() => ({}));\n      if (!r.ok) throw new Error(j.error || `Błąd ${r.status}`);\n      const changed = !state.school || state.school.edupage !== j.edupage;\n      if (changed) forgetSchoolData();\n      state.school = { name: j.name || null, edupage: j.edupage };\n      LS.set('plan.school', state.school);\n      toast(`Ustawiono szkołę: ${j.name || j.edupage + '.edupage.org'}`);\n      if (changed || !state.cls) showPicker(false); else hideSetup();\n    } catch (e) {\n      out.innerHTML = `<p class=\"msg\">✗ ${esc(e.message)}</p>`;\n    } finally {\n      $('#setupSave').disabled = false;\n    }\n  }\n\n  function renderInstallHint() {\n    const el = $('#installHint');\n    const ua = navigator.userAgent || '';\n    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);\n    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);\n    if (!ios || standalone || DEMO || LS.get('plan.installHint', '') === 'hidden') { el.innerHTML = ''; return; }\n    el.innerHTML = `<div class=\"notice info\"><p>Dodaj plan do ekranu iPhone'a: stuknij Udostępnij (kwadrat ze strzałką) w Safari, potem „Do ekranu początkowego”. Plan otworzy się jak aplikacja.</p>\n      <button class=\"btn\" type=\"button\" data-act=\"hide-install\">Nie pokazuj</button></div>`;\n  }\n\n  if ('serviceWorker' in navigator && !DEMO && (location.protocol === 'https:' || location.hostname === 'localhost')) {\n    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });\n  }\n\n  let toastTimer = null;\n  function toast(text) {\n    const t = $('#toast');\n    t.textContent = text;\n    t.classList.add('show');\n    clearTimeout(toastTimer);\n    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);\n  }\n\n  document.addEventListener('click', (ev) => {\n    const t = ev.target.closest('button, dialog');\n    if (!t) return;\n    if (t.tagName === 'DIALOG') { if (ev.target === t) t.close(); return; }\n    if (t.dataset.close !== undefined) { t.closest('dialog').close(); return; }\n    if (t.dataset.date) { state.selected = t.dataset.date; if (state.view === 'week') state.view = 'day'; render(); return; }\n    if (t.dataset.view) { state.view = t.dataset.view; render(); return; }\n    if (t.dataset.detail) { const [iso, id] = t.dataset.detail.split('|'); openDetail(iso, id); return; }\n    if (t.dataset.class) { chooseClass(t.dataset.class); return; }\n    if (t.dataset.group) {\n      const [div, g] = t.dataset.group.split('|');\n      state.prefs.groups = { ...(state.prefs.groups || {}), [div]: g };\n      state.prefs.asked = true;\n      LS.set(prefsKey(), state.prefs);\n      render();\n      syncPush();\n      toast(g === '*' ? 'Pokazuję obie grupy. Zmienisz to w ustawieniach.' : `Pokazuję lekcje grupy ${g}.`);\n      return;\n    }\n    switch (t.dataset.act || t.id) {\n      case 'retry': refreshAll(true); break;\n      case 'classBtn': showPicker(true); break;\n      case 'settingsBtn': openSettings(); break;\n      case 'prevWeek': state.weekOffset--; state.selected = null; render(); loadSubstitutions().then(render); break;\n      case 'nextWeek': state.weekOffset++; state.selected = null; render(); loadSubstitutions().then(render); break;\n      case 'pickerCancel': $('#picker').hidden = true; $('#app').hidden = false; $('#headNav').hidden = false; break;\n      case 'check': {\n        const out = $('#checkOut');\n        out.hidden = false; out.textContent = 'Sprawdzam…';\n        api('/api/check').then((r) => { out.textContent = typeof r === 'string' ? r : JSON.stringify(r, null, 2); })\n          .catch((e) => { out.textContent = '✗ ' + e.message; });\n        break;\n      }\n      case 'push-on': case 'push-off': case 'push-test': pushAction(t.dataset.act); break;\n      case 'push-later': LS.set('plan.pushCard', 'hidden'); render(); toast('Powiadomienia włączysz później w Ustawieniach.'); break;\n      case 'picker-retry': showPicker(!!state.cls); break;\n      case 'change-school': $('#settings').close(); showSetup(true); break;\n      case 'setup-save': saveSetup(); break;\n      case 'setup-cancel': hideSetup(); break;\n      case 'hide-install': LS.set('plan.installHint', 'hidden'); renderInstallHint(); break;\n      case 'change-class': $('#settings').close(); showPicker(true); break;\n      case 'reset':\n        Object.keys(localStorage).filter((k) => k.startsWith('plan.')).forEach((k) => LS.del(k));\n        location.reload();\n        break;\n      default:\n    }\n  });\n\n  document.addEventListener('change', (ev) => {\n    const t = ev.target;\n    if (t.dataset && t.dataset.div) {\n      state.prefs.groups = { ...(state.prefs.groups || {}), [t.dataset.div]: t.value };\n      state.prefs.asked = true;\n      LS.set(prefsKey(), state.prefs);\n      render();\n      syncPush();\n    }\n    if (t.id === 'defView') { state.view = t.value; LS.set('plan.view', t.value); render(); }\n    if (t.id === 'demoTime') {\n      if (t.value === 'live') setSim(null);\n      else {\n        const [h, m] = t.value.split(':').map(Number);\n        const d = DEMO && DEMO.date ? C.parseIso(DEMO.date) : new Date();\n        d.setHours(h, m, 0, 0);\n        setSim(d);\n      }\n    }\n  });\n  $('#classSearch').addEventListener('input', () => drawClasses());\n  $('#classSearch').addEventListener('keydown', (e) => {\n    if (e.key === 'Enter') { const first = $('#classList .class-opt'); if (first) first.click(); }\n  });\n  document.addEventListener('keydown', (e) => {\n    if (e.target.closest('input, select, dialog') || $('#app').hidden) return;\n    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {\n      const week = visibleWeek(); const i = week.indexOf(state.selected);\n      const j = i + (e.key === 'ArrowRight' ? 1 : -1);\n      if (j >= 0 && j < week.length) { state.selected = week[j]; render(); }\n    }\n  });\n  window.addEventListener('online', () => refreshAll());\n  window.addEventListener('offline', render);\n  document.addEventListener('visibilitychange', () => {\n    if (document.visibilityState === 'visible' && state.cls && (!state.lastSync || Date.now() - state.lastSync > 2 * 60 * 1000)) refreshAll();\n    else render();\n  });\n\n  let lastMinute = -1;\n  setInterval(() => {\n    if (!state.cls || $('#app').hidden) return;\n    const m = now().getMinutes();\n    if (m !== lastMinute) { lastMinute = m; render(); }\n  }, TICK_MS / 3);\n  setInterval(() => { if (state.cls && document.visibilityState !== 'hidden') loadSubstitutions().then(render); }, REFRESH_SUBST_MS);\n  setInterval(() => { if (state.cls && document.visibilityState !== 'hidden') loadTimetable().then(render); }, REFRESH_TT_MS);\n\n  if (DEMO) {\n    $('#demoBar').innerHTML = `<div class=\"demo-bar notice info\"><span>${esc(DEMO.note || 'Podgląd z zapisanymi danymi.')}</span>\n      <label>Godzina: <select id=\"demoTime\"><option value=\"live\">aktualna</option>\n      ${['07:40', '08:20', '09:50', '10:30', '12:00', '13:12', '14:45'].map((t) => `<option value=\"${t}\">${t}</option>`).join('')}</select></label></div>`;\n  }\n\n  const wantDay = params.get('dzien');\n  if (wantDay && /^\\d{4}-\\d{2}-\\d{2}$/.test(wantDay)) {\n    const base = C.weekDates(now(), isWeekend(now()) ? 1 : 0)[0];\n    const diff = Math.round((C.parseIso(wantDay) - C.parseIso(base)) / (7 * 86400000));\n    state.weekOffset = Math.floor(diff); state.selected = wantDay; state.view = 'day';\n  }\n  pushServer();\n\n  $('#setupInput').addEventListener('input', updateSetupHelp);\n  $('#setupInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && CFG.mode !== 'proxy') saveSetup(); });\n\n  function startApp() {\n    if (state.cls) {\n      restoreCache();\n      $('#app').hidden = false;\n      $('#headNav').hidden = false;\n      render();\n      refreshAll();\n    } else {\n      showPicker(false);\n    }\n  }\n\n  applySchool();\n  if (state.school) {\n    startApp();\n    loadSchool().then(() => { if (!state.cls && $('#picker').hidden && $('#setup').hidden) showPicker(false); })\n      .catch((e) => { if (e.code === 'NOT_CONFIGURED') showSetup(); });\n  } else {\n    loadSchool().then(startApp).catch((e) => {\n      if (e.code === 'NOT_CONFIGURED') showSetup();\n      else startApp();\n    });\n  }\n}());\n"},"/sw.js":{"type":"text/javascript; charset=utf-8","body":"const CACHE = 'plan-v5';\nconst KEEP = ['plan-push'];\nconst SHELL = ['./', 'index.html', 'style.css', 'core.js', 'plan-lib.js', 'app.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png'];\n\nself.addEventListener('install', (e) => {\n  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));\n});\nself.addEventListener('activate', (e) => {\n  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !KEEP.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));\n});\nself.addEventListener('fetch', (e) => {\n  const url = new URL(e.request.url);\n  if (e.request.method !== 'GET' || url.origin !== location.origin || /\\/(api|ep|push)\\//.test(url.pathname)) return;\n\n  e.respondWith(\n    fetch(e.request).then((res) => {\n      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }\n      return res;\n    }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))\n  );\n});\n\nself.addEventListener('push', (e) => {\n  e.waitUntil((async () => {\n    let msg = null;\n    try { msg = e.data ? e.data.json() : null; } catch (_) { msg = null; }\n    if (!msg) {\n      try {\n        const cfgRes = await (await caches.open('plan-push')).match('config');\n        const cfg = cfgRes ? await cfgRes.json() : {};\n        const r = await fetch(`push/msg?id=${encodeURIComponent(cfg.id || '')}&k=${encodeURIComponent(cfg.msgKey || '')}`, { cache: 'no-store' });\n        if (r.ok) msg = await r.json();\n      } catch (_) {}\n    }\n    if (!msg || !msg.title) msg = { title: 'Zmiany w planie lekcji', body: 'Otwórz plan, żeby zobaczyć szczegóły.' };\n    await self.registration.showNotification(msg.title, {\n      body: msg.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: msg.tag || 'plan', renotify: true,\n      data: { url: './' + (msg.date ? '?dzien=' + msg.date : '') },\n    });\n  })());\n});\n\nself.addEventListener('notificationclick', (e) => {\n  e.notification.close();\n  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;\n  e.waitUntil((async () => {\n    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });\n    for (const w of wins) { if ('focus' in w) { w.navigate(target).catch(() => {}); return w.focus(); } }\n    return self.clients.openWindow(target);\n  })());\n});\n"},"/manifest.webmanifest":{"type":"application/manifest+json","body":"{\n  \"name\": \"Plan lekcji\",\n  \"short_name\": \"Plan lekcji\",\n  \"start_url\": \"./\",\n  \"scope\": \"./\",\n  \"display\": \"standalone\",\n  \"background_color\": \"#eef1f4\",\n  \"theme_color\": \"#1f3b63\",\n  \"lang\": \"pl\",\n  \"icons\": [\n    { \"src\": \"icon-192.png\", \"sizes\": \"192x192\", \"type\": \"image/png\" },\n    { \"src\": \"icon-512.png\", \"sizes\": \"512x512\", \"type\": \"image/png\" }\n  ]\n}\n"},"/icon-180.png":{"type":"image/png","b64":true,"body":"iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAIAAACyr5FlAAACkElEQVR4nO3dwU0cMQBA0RBxo4ikgVSQdJOUkDJSAuXQAQ3QRO7cEAL+SpnZsdfZ924gMbKsv+PVrsfcfPn+8xN85PPsAXC5xEESB0kcJHGQxEESB0kcJHGQxEESB0kcJHGQxEESB0kcJHGQxEESB0kcJHGQxEESB0kcJHGQxEESB+l29gC2eHq4f/3j1x+/Zo3ktFXGWda7c7yZ8Q9/cwlWGecJi8VR83tp877KOE9bLA5GEgdJHCRxkMRBEgdJHCRxkMRBujn6HNK1PhNczqHf17hzkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHCRxkMRBEgdJHKShB8ZtewLn5bGoPQ/w/E8XGfacmDsHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkZ5+vzdnnzCEOkt3n611k2Eq95P+y3+nb77sNf/X45+/ZR3LhLCskcZDEQRIHSRwkcZDEQRIHSRwkcZDEQRIHSRwkcZDEQbrG/RxXuDNjGxuM12aDMXOIg2SD8XoXcbw184mDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiIImDJA6SOEjiINlgvDYbjJlDHCQbjNe7iA3GzCcOkjhI4iCJgyQOkjhI4iCJgyQOkjhIQ+Pw9f1+I+fw8DgO3XBw5Y6e29HLipvHHoNnb0QcbwJ/eriXyL96P2kDbsmHbxN8IYgzGrNYj1tWvPk4l2EzOfQ9hz72GzmH45aV1ywxG4x/ac2JgyX4hJQkDpI4SOIgiYMkDpI4SOIgiYMkDpI4SOIgiYMkDpI4SOIgiYMkDpI4SOIgiYMkDpI4SOIgiYMkDpI4SOIgiYMkDtIzv7KKq7QKHXkAAAAASUVORK5CYII="},"/icon-192.png":{"type":"image/png","b64":true,"body":"iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAADdvvtQAAACyklEQVR4nO3dwU0bQQBAURNxo4ikgVSQdAMlpIyUQDl0kAZoIncOSCiyAEX+65md1Xs3kFiN1p+xvZ7x3nz9cX+CS32ZPQDWJiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJLezB1A9Pz3+++O3nw+zRvL/VhzzR9aegc4eiXd/szcrjvkTCwf00Xnf8+Ox4pg/t3BA7IGASAREIiASAZEIiERAJAIiERDJzZhvql/3Suu6xnzEZgYiERCJgEgERCIgEgGRCIhEQCQCOqwxF28FRCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREMuFrfi/ecvu2xK5v2j3woQbvIjcDkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCRu93RkA+74ZAYiERCJbT1HO9TgVwsTAtqb77/uLv7bP7//bjiSFXkKIxEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJBaUWRSWmIFIbOs5Mtt62DsBkdjWc7RDuVsPKxEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZEIiERAJAIiERCJXRlHZlcGeycgErsyjnYouzJYiYBIBEQiIBIBkQiIREAkAiIREImASAREIiCSCQFZG3Q948/toIAGrGzizJhzPucpzCR0DVPO6riAzv4hNLSts/M5bMqf+SJaQ5t4fnqcVc9p2KL6N6IZ4MgBnTR0TePfrEwI6JWMNjflre60gF7JaBMTr5JMDojV+SiDREAkAiIREImASAREIiASAZEIiERAJAIiERCJgEgERCIgEgGRCIhEQCQCIhEQiYBIBEQiIBIBkQiIREAkAiIREImASAREIiASAZG8AM3PlHu0PKx0AAAAAElFTkSuQmCC"},"/icon-512.png":{"type":"image/png","b64":true,"body":"iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAJIUlEQVR4nO3cwXHbRhiAUTGjW4ogG0gFZDdkCSkjJbAcduAG2ITvOWQmB0umAYr0Avzeu1qe+THE7oeVBG22++MbAD1/jB4AgDEEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKLeRw/AYNfL+fYX7A6n3zMJD+fD5bbNdn8cPQNj/HJ3+IHNYkV8uEzhW0BRczeI+/4LQ/hwmUgAiu5e7baJ5fPhMp0A5HxxndsmlsyHyywCABAlAC0PecTznLhMPlzmEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiNps98fRMyzL9XIePQLwFLvDafQIy+IEABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAQMX1ch49wrIIAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBAlAAARAkAQJQAAEQJAECUAABECQBA1PvoAdZndziNHuFz18v5Z/+02Jk/eoGreIFLeFvtVdwYm4+cAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAogQAIEoAAKI22/1x9AzLcr2cR48APMvucBo9woI4AQBECQBAlAAARAkAQJQAAEQJAECUAABECQBA1PvoAdZnsS+S3HiFbbEzf/QCV/ECl/C22qvwIucsTgAAUQIAECUAAFF+BsD6/PX3n6NH+MS3f76PHgHmcQIAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAqPfRA8Bs3/75PnoEeAVOAABRAgAQJQAAUZvt/jh6hmW5Xs6jRwCeZXc4jR5hQZwAAKIEACBKAACiBAAgSgAAogQAIEoAAKIEACDKH4ObbbEvktx4hW2xM3/0AlfxApfwttqr8CLnLE4AAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABAlAABRAgAQJQAAUQIAECUAAFECABC12e6Po2dYluvlPHoE4Fl2h9PoERbECQAgSgAAogQAIEoAAKIEACBKAACiBAAgSgAAot5HD7A+i32R5MYrbIud+aMXuIoXuIS31V6FFzlncQIAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAGY7Xo5jx4B+IS1OZcA/Gh3OI0eAXgKq/sHAgAQJQD3cNKEpbEq7yAAAFEC8Ikp3yj0uAHLMWU9+gHARwIAECUA93MIgCWwEu8mAJ+beFp058FYE9eg7/98SgC+SgNgFKvviwTgp6Y/MrgL4febvu48/v+MANyiAbBA18vZ7v8Q76MHeB3/3ZHuNngeT1qPJQC/sDucZt1z/3+xEsCj3L3vW4a3bbb74+gZVsBzB6yO3f+X/AxgEncSrIs1O4UATOV+grWwWicSgBncVbB81ul0AjCPewuWzAqdRQBmc4fBMlmbc/ktoDv5vSBYDlv/fQTgS2QAhrP7300AHkAGYAhb/xcJwCMpAfwG9v1HEYCnUAJ4LJv+MwgAQJRfAwWIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIgSAIAoAQCIEgCAKAEAiBIAgCgBAIj6F3cN4rNUC6vJAAAAAElFTkSuQmCC"}};

const LIB = (function () {
  var defs = {};
  defs['./html'] = function (module, exports, require) {
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

};
  defs['./substitutions'] = function (module, exports, require) {
'use strict';

const { htmlToLines, decodeEntities } = require('./html');

const ARROW = /\s*(?:➔|→|⇒|->|=>)\s*/;
const TIME_RANGE = /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*,?\s*/;
const PERIOD_RE = /^\(?\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*\)?$/;
const ALL_DAY_RE = /^\(?\s*ca[łl]y\s+dzie[ńn]\s*\)?$/i;
const NO_SUBST_RE = /nie\s+ma\s+(?:żadnych\s+)?zast[ęe]pstw/i;
const CANCEL_RE = /^(anulowan|odwo[łl]an|lekcja\s+odwo[łl]ana|cancel)/i;
const ABSENT_RE = /nieobecno[śs][ćc]/i;

const NAME_RE = /^[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'’.-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'’.-]+){1,3}$/u;

function pad(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  return m ? m[1].padStart(2, '0') + ':' + m[2] : t;
}

function splitTopLevel(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

function splitChange(value) {
  const m = /^\((.*)\)\s*(?:➔|→|⇒|->|=>)\s*(.*)$/.exec(value.trim());
  if (m) return { from: m[1].trim(), to: m[2].trim() };
  const parts = value.split(ARROW);
  if (parts.length === 2) return { from: parts[0].replace(/^\(|\)$/g, '').trim(), to: parts[1].trim() };
  return { to: value.trim() };
}

function labelKind(label) {
  const l = label.toLowerCase();
  if (/zast|nauczyc|prowadz|teacher/.test(l)) return 'teacher';
  if (/sal[aęi]|room|klasar|pomieszcz/.test(l)) return 'room';
  if (/przedmiot|subject/.test(l)) return 'subject';
  if (/grup|group/.test(l)) return 'group';
  return 'note';
}

function parsePeriodText(text) {
  const t = text.trim();
  if (ALL_DAY_RE.test(t)) return { allDay: true, cancelledHint: t.startsWith('(') };
  const m = PERIOD_RE.exec(t);
  if (!m) return null;
  const from = Number(m[1]);
  const to = m[2] ? Number(m[2]) : from;
  return { from: Math.min(from, to), to: Math.max(from, to), cancelledHint: t.startsWith('(') };
}

function parseInfo(text, period, hints, subjectNames) {
  const e = {
    periodFrom: period && !period.allDay ? period.from : null,
    periodTo: period && !period.allDay ? period.to : null,
    allDay: !!(period && period.allDay),
    start: null, end: null,
    groups: [],
    subject: null, subjectFrom: null,
    teachers: [], teacherFrom: [], teacherTo: [], teachersAdded: [],
    room: null, roomFrom: null, roomTo: null,
    cancelled: false, absent: false,
    notes: [],
    raw: text,
  };
  let rest = text.trim();
  const tm = TIME_RANGE.exec(rest);
  if (tm) { e.start = pad(tm[1]); e.end = pad(tm[2]); rest = rest.slice(tm[0].length); }

  if (hints.includes('absent') || (ABSENT_RE.test(rest) && !/ - /.test(rest))) {
    e.absent = true;
    e.notes.push(rest.trim() || 'Nieobecność');
    return e;
  }

  const dash = rest.search(/\s[-–]\s/);
  let head = dash >= 0 ? rest.slice(0, dash) : rest;
  const tail = dash >= 0 ? rest.slice(dash).replace(/^\s[-–]\s/, '') : '';

  const gm = /^([^():]{1,30}):\s+(.+)$/.exec(head.trim());
  if (gm) { e.groups = gm[1].split(/\s*,\s*/).filter(Boolean); head = gm[2]; }
  const sc = splitChange(head);
  const subj = (s) => (s ? { short: s, name: (subjectNames && (subjectNames[s] || subjectNames[s.toLowerCase()])) || null } : null);
  if (sc.from !== undefined) { e.subjectFrom = subj(sc.from); e.subject = subj(sc.to); } else { e.subject = subj(sc.to); }

  let last = 'start';
  for (const seg of splitTopLevel(tail)) {
    if (CANCEL_RE.test(seg)) { e.cancelled = true; last = 'cancel'; continue; }

    const plus = /^\+\s*(.+)$/.exec(seg);
    if (plus && NAME_RE.test(plus[1].trim())) { e.teachersAdded.push(plus[1].trim()); last = 'added'; continue; }

    const gone = /^\((.+)\)$/.exec(seg);
    if (gone && splitTopLevel(gone[1]).every((n) => NAME_RE.test(n))) { e.teacherFrom.push(...splitTopLevel(gone[1])); last = 'gone'; continue; }
    const lm = /^([\p{L} ]{3,40}?)\s*:\s*(.*)$/u.exec(seg);
    if (lm) {
      const kind = labelKind(lm[1]);
      const v = splitChange(lm[2].replace(/^[-–]\s+/, ''));
      if (kind === 'teacher') {
        if (v.from !== undefined) {
          e.teacherFrom.push(...splitTopLevel(v.from));
          e.teacherTo.push(v.to);
          last = 'teacherTo';
        } else { e.teachers.push(v.to); last = 'teachers'; }
      } else if (kind === 'room') {
        if (v.from !== undefined) { e.roomFrom = v.from; e.roomTo = v.to; } else e.room = v.to;
        last = 'room';
      } else if (kind === 'subject') {
        if (v.from !== undefined) e.subjectFrom = subj(v.from);
        e.subject = subj(v.to);
        last = 'subject';
      } else if (kind === 'group') {
        e.groups.push(...v.to.split(/\s*,\s*/)); last = 'group';
      } else { e.notes.push(seg); last = 'note'; }
      continue;
    }
    if (NAME_RE.test(seg) && (last === 'start' || last === 'teachers' || last === 'teacherTo')) {
      if (last === 'teacherTo') e.teacherTo.push(seg); else { e.teachers.push(seg); last = 'teachers'; }
      continue;
    }
    if (last === 'note' && /^[a-ząćęłńóśźż0-9]/.test(seg)) {
      e.notes[e.notes.length - 1] += ', ' + seg;
      continue;
    }
    e.notes.push(seg);
    last = 'note';
  }
  if (period && period.cancelledHint) e.cancelled = true;
  if (hints.includes('remove')) e.cancelled = true;
  return e;
}

function extractReportHtml(input) {
  let s = String(input || '');
  const rm = /"report_html"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(s);
  if (rm) {
    try { return JSON.parse(rm[1]); } catch (_) {}
  }
  const i = s.search(/<[^>]+data-date\s*=/);
  if (i >= 0) s = s.slice(i);
  return s;
}

function parseClassList(value) {
  return splitTopLevel(value).map((item) => {
    const m = /^(.*?)\s*(?:\(\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*\))?$/.exec(item.trim());
    const name = (m ? m[1] : item).trim();
    const from = m && m[2] ? Number(m[2]) : null;
    const to = m && m[3] ? Number(m[3]) : from;
    return { name, from, to };
  }).filter((x) => x.name);
}

function parseSubstitutions(input, opts = {}) {
  const html = extractReportHtml(input);
  const dm = /data-date\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/.exec(html);
  const out = {
    date: dm ? dm[1] : opts.date || null,
    updatedAt: null,
    info: {},
    absentClasses: [],
    empty: false,
    classes: {},
  };
  const lines = htmlToLines(html);
  let current = null;
  let pending = null;
  let inSections = false;

  for (const line of lines) {
    const t = decodeEntities(line.text).trim();
    if (!t) continue;
    if (/asctimetables|edupage\.org/i.test(t)) {
      const um = /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}:\d{2})/.exec(t);
      if (um) out.updatedAt = `${um[3]}-${um[2]}-${um[1]}T${pad(um[4])}`;
      continue;
    }
    if (NO_SUBST_RE.test(t)) { out.empty = true; pending = null; continue; }

    const period = parsePeriodText(t);
    if (period && current) { pending = { ...period, hints: line.hints }; continue; }

    if (pending || (current && TIME_RANGE.test(t))) {
      const hints = [...new Set([...(pending ? pending.hints : []), ...line.hints])];
      const entry = parseInfo(t, pending, hints, opts.subjectNames);
      (out.classes[current] = out.classes[current] || []).push(entry);
      pending = null;
      continue;
    }

    const lab = /^([^:]{3,45}):\s*(.*)$/.exec(t);
    if (!inSections && lab && !TIME_RANGE.test(t)) {
      out.info[lab[1].trim()] = lab[2].trim();
      if (/klasy|oddzia/i.test(lab[1]) && /nieobec/i.test(lab[1])) out.absentClasses = parseClassList(lab[2]);
      continue;
    }

    if (t.length <= 30) { current = t; inSections = true; pending = null; continue; }
  }
  if (!Object.keys(out.classes).length && !out.empty && !lines.some((l) => /\d:\d\d/.test(l.text))) out.empty = true;
  return out;
}

function normKey(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }

function entriesForClass(parsed, cls) {
  const keys = new Set([normKey(cls.short), normKey(cls.name), normKey(String(cls.name || '').split(/\s+/)[0])].filter(Boolean));
  const entries = [];
  for (const [header, list] of Object.entries(parsed.classes || {})) {
    if (keys.has(normKey(header))) entries.push(...list);
  }
  for (const a of parsed.absentClasses || []) {
    if (!keys.has(normKey(a.name))) continue;
    const covered = entries.some((e) => e.absent && (e.allDay || (a.from != null && e.periodFrom <= a.from && e.periodTo >= a.to)));
    if (!covered) {
      entries.push({
        periodFrom: a.from, periodTo: a.to, allDay: a.from == null, start: null, end: null, groups: [],
        subject: null, subjectFrom: null, teachers: [], teacherFrom: [], teacherTo: [], room: null, roomFrom: null, roomTo: null,
        cancelled: false, absent: true, notes: ['Nieobecność klasy'], raw: '',
      });
    }
  }
  return entries;
}

module.exports = { parseSubstitutions, entriesForClass, parseInfo, splitTopLevel, extractReportHtml };

};
  defs['./edupage'] = function (module, exports, require) {
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

};
  var cache = {};
  function req(n) { var k = './' + n.replace(/^\.\//, ''); if (cache[k]) return cache[k].exports; var m = { exports: {} }; cache[k] = m; defs[k](m, m.exports, req); return m.exports; }
  var s = req('./substitutions'); var e = req('./edupage');
  return { parseSubstitutions: s.parseSubstitutions, entriesForClass: s.entriesForClass, normalizeEdupage: e.normalizeEdupage, schoolNameFromHtml: e.schoolNameFromHtml, notConfigured: e.notConfigured };
})();

const PUSH_HOSTS = /(^|\.)push\.apple\.com$|^fcm\.googleapis\.com$|(^|\.)push\.services\.mozilla\.com$|(^|\.)notify\.windows\.com$|^web\.push\.apple\.com$/;
const PUSH_BATCH = 40;
const DAY_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

const b64url = {
  enc(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  encStr(str) { return b64url.enc(new TextEncoder().encode(str)); },
};

function warsawParts(ms) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), weekday: wd };
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekdayOf(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
function nextSchoolDay(iso) {
  let d = addDays(iso, 1);
  while ([0, 6].includes(weekdayOf(d))) d = addDays(d, 1);
  return d;
}

function cleanGroup(g) { return String(g || '').toLowerCase().replace(/^(grupa|gr\.?|g)\s*(?=\d)/, '').replace(/[^a-z0-9_ąćęłńóśźż]/g, '').slice(0, 12); }
function variantOf(exclude) { const v = [...new Set((exclude || []).map(cleanGroup).filter(Boolean))].sort(); return v.length ? v.join('+') : 'all'; }

async function sha(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

let vapidMemo = null;
async function getVapid(env) {
  if (vapidMemo) return vapidMemo;
  let v = await env.PUSH.get('vapid', 'json');
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey);
    v = { publicKey: b64url.enc(pub), privateJwk: await crypto.subtle.exportKey('jwk', kp.privateKey) };
    await env.PUSH.put('vapid', JSON.stringify(v));
    v = (await env.PUSH.get('vapid', 'json')) || v;
  }
  vapidMemo = { ...v, key: await crypto.subtle.importKey('jwk', v.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']) };
  return vapidMemo;
}

const jwtMemo = new Map();
async function vapidHeader(env, endpoint) {
  const aud = new URL(endpoint).origin;
  const memo = jwtMemo.get(aud);
  const now = Math.floor(Date.now() / 1000);
  const v = await getVapid(env);
  if (memo && memo.exp - now > 3600) return memo.header;
  const exp = now + 12 * 3600;
  const subject = (await env.PUSH.get('site')) || 'https://edupage.org';
  const unsigned = b64url.encStr(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) + '.' + b64url.encStr(JSON.stringify({ aud, exp, sub: subject }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, v.key, new TextEncoder().encode(unsigned));
  const header = `vapid t=${unsigned}.${b64url.enc(sig)}, k=${v.publicKey}`;
  jwtMemo.set(aud, { exp, header });
  return header;
}

async function sendPush(env, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(env, endpoint), TTL: '43200', Urgency: 'high', 'Content-Length': '0' },
  });
  return res.status;
}

function subjectName(s, dict) {
  if (!s) return '';
  return s.name || (dict && (dict[s.short] || dict[String(s.short).toLowerCase()])) || s.short;
}

function describeEntry(e, dict) {
  let label;
  if (e.allDay) label = 'Cały dzień';
  else if (e.periodFrom === e.periodTo) label = `${e.periodFrom}. lekcja`;
  else label = `Lekcje ${e.periodFrom}–${e.periodTo}`;
  if (e.groups && e.groups.length) label += ` (gr. ${e.groups.join(', ')})`;
  const subj = subjectName(e.subject, dict);
  if (e.absent) return `${label}: klasa nieobecna`;
  if (e.cancelled) return `${label}: odwołana${subj ? ` (${subj})` : ''}`;
  const parts = [];
  if (e.subjectFrom) parts.push(`${subj} (było: ${subjectName(e.subjectFrom, dict)})`);
  else if (subj) parts.push(subj);
  if (e.teacherTo && e.teacherTo.length) parts.push(`zastępstwo: ${e.teacherTo.concat(e.teachersAdded || []).join(', ')}`);
  else if (e.teachersAdded && e.teachersAdded.length) parts.push(`dodatkowo: ${e.teachersAdded.join(', ')}`);
  if (e.roomTo) parts.push(`sala ${e.roomFrom ? e.roomFrom + ' → ' : ''}${e.roomTo}`);
  else if (e.room) parts.push(`sala ${e.room}`);
  if (parts.length <= 1 && e.notes && e.notes.length) parts.push(e.notes[0]);
  return `${label}: ${parts.join(', ')}`;
}

function composeMessage(date, today, short, entries, dict) {
  let day;
  if (date === today) day = 'Dziś';
  else if (date === addDays(today, 1)) day = 'Jutro';
  else day = DAY_PL[weekdayOf(date)].replace(/^./, (c) => c.toUpperCase());
  const title = `${day} (${date.slice(8, 10)}.${date.slice(5, 7)}): ${entries.length === 1 ? 'zmiana' : 'zmiany'} w planie ${short}`;
  const lines = entries.slice(0, 4).map((e) => describeEntry(e, dict));
  if (entries.length > 4) lines.push(`i jeszcze ${entries.length - 4} — otwórz plan`);
  return { title, body: lines.join('\n'), date, ts: Date.now(), tag: `plan-${short}-${date}` };
}

function visibleFor(entry, exclude) {
  if (!entry.groups || !entry.groups.length) return true;
  const ex = new Set((exclude || []).map(cleanGroup));
  return entry.groups.some((g) => !ex.has(cleanGroup(g)));
}

async function readJson(request) {
  try { return await request.json(); } catch (_) { return null; }
}

async function pushRoute(request, env, url) {
  const p = url.pathname;
  if (!env.PUSH) return json({ error: 'Powiadomienia nie są włączone na serwerze (brak bazy PUSH).', off: true }, 404);

  if (p === '/push/key') {
    const v = await getVapid(env);
    return json({ key: v.publicKey });
  }

  if (p === '/push/subscribe' && request.method === 'POST') {
    const b = await readJson(request);
    if (!b || typeof b.endpoint !== 'string' || !b.cls) return json({ error: 'Zły format' }, 400);
    let host;
    try { host = new URL(b.endpoint).hostname; } catch (_) { return json({ error: 'Zły adres' }, 400); }
    if (!(env.PUSH_ALLOW_ANY === '1' || (b.endpoint.startsWith('https://') && PUSH_HOSTS.test(host)))) return json({ error: 'Nieznana usługa powiadomień' }, 400);
    const short = String(b.cls.short || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
    const name = String(b.cls.name || short).slice(0, 40);
    if (!short) return json({ error: 'Brak klasy' }, 400);
    const exclude = (Array.isArray(b.exclude) ? b.exclude : []).map(cleanGroup).filter(Boolean).slice(0, 8);
    const variant = variantOf(exclude);
    const id = await sha(b.endpoint);
    const key = `s:${short}:${variant}:${id}`;
    if (b.prevKey && b.prevKey !== key && /^s:[A-Za-z0-9]+:[^:]+:[0-9a-f]+$/.test(b.prevKey)) await env.PUSH.delete(b.prevKey);
    await env.PUSH.put(key, '1', { metadata: { e: b.endpoint } });
    const reg = (await env.PUSH.get('reg', 'json')) || {};
    const rk = `${short}|${variant}`;
    if (!reg[rk]) { reg[rk] = { name, short, ex: exclude }; await env.PUSH.put('reg', JSON.stringify(reg)); }
    if (!(await env.PUSH.get('site'))) await env.PUSH.put('site', url.origin);
    return json({ id, key, msgKey: `${short}:${variant}` });
  }

  if (p === '/push/unsubscribe' && request.method === 'POST') {
    const b = await readJson(request);
    if (b && typeof b.key === 'string' && /^s:[A-Za-z0-9]+:[^:]+:[0-9a-f]+$/.test(b.key)) await env.PUSH.delete(b.key);
    return json({ ok: true });
  }

  if (p === '/push/test' && request.method === 'POST') {
    const b = await readJson(request);
    if (!b || typeof b.key !== 'string') return json({ error: 'Zły format' }, 400);
    const list = await env.PUSH.list({ prefix: b.key, limit: 1 });
    const k = list.keys[0];
    if (!k || k.name !== b.key) return json({ error: 'Nie znaleziono subskrypcji. Włącz powiadomienia ponownie.' }, 404);
    const id = b.key.split(':').pop();
    await env.PUSH.put(`t:${id}`, JSON.stringify({ title: 'Próbne powiadomienie', body: 'Działa. Tak będą wyglądały powiadomienia o zmianach w planie.', ts: Date.now(), tag: 'plan-test' }), { expirationTtl: 300 });
    const status = await sendPush(env, k.metadata.e);
    return json({ ok: status < 300, status });
  }

  if (p === '/push/msg') {
    const id = (url.searchParams.get('id') || '').replace(/[^0-9a-f]/g, '');
    const mk = (url.searchParams.get('k') || '').replace(/[^A-Za-z0-9:+_ąćęłńóśźż]/g, '');
    const [test, list] = await Promise.all([id ? env.PUSH.get(`t:${id}`, 'json') : null, mk ? env.PUSH.get(`m:${mk}`, 'json') : null]);
    const latest = (list || [])[0] || null;
    const pick = test && (!latest || test.ts > latest.ts) ? test : latest;
    return json(pick || { title: 'Zmiany w planie lekcji', body: 'Otwórz plan, żeby zobaczyć szczegóły.' });
  }

  return json({ error: 'Nieznany adres' }, 404);
}

async function substitutionsFor(env, date) {
  const args = [null, { date, mode: 'classes' }];
  const url = new URL('https://cron.local/ep/substitution/server/viewer.js');
  url.searchParams.set('__func', 'getSubstViewerDayDataHtml');
  url.searchParams.set('args', JSON.stringify(args));
  const res = await forwardGet(null, env, null, '/substitution/server/viewer.js', url, true);
  const j = await res.json();
  if (typeof j.r !== 'string') throw new Error('Brak zastępstw dla ' + date + ': ' + JSON.stringify(j).slice(0, 120));
  return LIB.parseSubstitutions(j.r, { date });
}

async function subjectDict(env) {
  try {
    const url = new URL('https://cron.local/ep/rpr/server/maindbi.js');
    url.searchParams.set('__func', 'mainDBIAccessor');
    const year = (await getSession(env)).year;
    url.searchParams.set('args', JSON.stringify([null, year, {}, { op: 'fetch', needed_part: { subjects: ['short', 'name'] }, needed_combos: {} }]));
    const res = await forwardGet(null, env, null, '/rpr/server/maindbi.js', url, true);
    const j = await res.json();
    const t = ((j.r && j.r.tables) || []).find((x) => x.id === 'subjects');
    const d = {};
    for (const s of (t && t.data_rows) || []) if (s.short && s.name && !d[s.short]) d[s.short] = s.name;
    return d;
  } catch (_) { return null; }
}

async function rebuildRegistry(env) {
  const reg = {};
  let cursor;
  do {
    const r = await env.PUSH.list({ prefix: 's:', cursor, limit: 1000 });
    for (const k of r.keys) {
      const [, short, variant] = k.name.split(':');
      const rk = `${short}|${variant}`;
      if (!reg[rk]) reg[rk] = { name: short, short, ex: variant === 'all' ? [] : variant.split('+') };
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  const old = (await env.PUSH.get('reg', 'json')) || {};
  for (const k of Object.keys(reg)) if (old[k]) reg[k].name = old[k].name;
  await env.PUSH.put('reg', JSON.stringify(reg));
  return reg;
}

async function processJobs(env, jobs, budget) {
  let sent = 0;
  for (const job of jobs) {
    while (budget > 0 && !job.done) {
      const r = await env.PUSH.list({ prefix: job.prefix, cursor: job.cursor || undefined, limit: Math.min(budget, PUSH_BATCH) });
      for (const k of r.keys) {
        if (!k.metadata || !k.metadata.e) continue;
        budget--; sent++;
        try {
          const st = await sendPush(env, k.metadata.e);
          if (st === 404 || st === 410) await env.PUSH.delete(k.name);
        } catch (_) {}
      }
      if (r.list_complete) job.done = true; else job.cursor = r.cursor;
    }
    if (budget <= 0) break;
  }
  return { left: jobs.filter((j) => !j.done), sent };
}

async function runCron(env, scheduledTime) {
  if (!env.PUSH) return { skipped: 'no KV' };
  if (!env.EDUPAGE_BASE && !schoolId(env)) return { skipped: 'no school' };
  const now = warsawParts(scheduledTime || Date.now());
  let jobs = (await env.PUSH.get('jobs', 'json')) || [];

  if (jobs.length) {
    const r = await processJobs(env, jobs, PUSH_BATCH);
    await env.PUSH.put('jobs', JSON.stringify(r.left));
    return { sent: r.sent, pending: r.left.length };
  }

  if (now.minute % 5 !== 0 || now.hour < 6 || now.hour >= 22) return { skipped: 'time' };
  const reg = now.hour === 6 && now.minute === 0 ? await rebuildRegistry(env) : (await env.PUSH.get('reg', 'json')) || {};
  const variants = Object.values(reg);
  if (!variants.length) return { skipped: 'no subscribers' };

  const dates = [];
  if (now.weekday >= 1 && now.weekday <= 5 && now.hour < 16) dates.push(now.date);
  dates.push(nextSchoolDay(now.date));

  let dict;
  const classes = [...new Map(variants.map((v) => [v.short, v])).values()];
  for (const date of dates) {
    let parsed;
    try { parsed = await substitutionsFor(env, date); } catch (e) { console.log('substitutions', date, e && e.message); continue; }
    const seen = (await env.PUSH.get(`seen:${date}`, 'json')) || {};
    let changed = false;
    for (const c of classes) {
      const entries = LIB.entriesForClass(parsed, { name: c.name, short: c.short });
      const known = new Set(seen[c.short] || []);
      const fresh = entries.filter((e) => !known.has(e.raw || JSON.stringify(e)));
      if (!fresh.length) continue;
      if (dict === undefined) dict = await subjectDict(env);
      for (const v of variants.filter((x) => x.short === c.short)) {
        const rel = fresh.filter((e) => visibleFor(e, v.ex));
        if (!rel.length) continue;
        const variant = variantOf(v.ex);
        const mk = `m:${c.short}:${variant}`;
        const list = (await env.PUSH.get(mk, 'json')) || [];
        list.unshift(composeMessage(date, now.date, c.short, rel, dict));
        await env.PUSH.put(mk, JSON.stringify(list.slice(0, 5)), { expirationTtl: 7 * 86400 });
        jobs.push({ prefix: `s:${c.short}:${variant}:`, cursor: null });
      }
      seen[c.short] = [...known, ...fresh.map((e) => e.raw || JSON.stringify(e))];
      changed = true;
    }
    if (changed) await env.PUSH.put(`seen:${date}`, JSON.stringify(seen), { expirationTtl: 4 * 86400 });
  }
  if (!jobs.length) return { checked: dates };
  const r = await processJobs(env, jobs, PUSH_BATCH - 6);
  await env.PUSH.put('jobs', JSON.stringify(r.left));
  return { checked: dates, sent: r.sent, pending: r.left.length };
}


const UA = 'Mozilla/5.0 (PlanLekcji) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const ALLOWED_POST = new Set([
  '/timetable/server/ttviewer.js',
  '/timetable/server/regulartt.js',
  '/rpr/server/maindbi.js',
  '/substitution/server/viewer.js',
]);
const ALLOWED_FUNC = /^(getTTViewerData|regularttGetData|mainDBIAccessor|getSubstViewerDayDataHtml)$/;

let session = null;

function schoolId(env) {
  return LIB.normalizeEdupage(env && env.EDUPAGE);
}

function base(env) {
  if (env && env.EDUPAGE_BASE) return env.EDUPAGE_BASE;
  const id = schoolId(env);
  if (!id) throw LIB.notConfigured();
  return `https://${id}.edupage.org`;
}

async function getSession(env, force) {
  const b = base(env);
  if (!force && session && session.base === b && Date.now() - session.at < 20 * 60 * 1000) return session;
  const res = await fetch(b + '/timetable/', { headers: { 'User-Agent': UA, 'Accept-Language': 'pl' } });
  if (!res.ok) throw new Error(`EduPage odpowiedział ${res.status}. Sprawdź adres szkoły w zmiennej EDUPAGE.`);
  const html = await res.text();
  if (!/ASC\.|edupage/i.test(html)) throw new Error('Pod tym adresem nie ma strony EduPage. Sprawdź zmienną EDUPAGE.');
  const cookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
  session = {
    base: b,
    cookie: cookies.map((c) => c.split(';')[0]).join('; '),
    gsh: (/gsechash\s*=\s*["']([0-9a-fA-F]+)["']/.exec(html) || [])[1] || '00000000',
    year: Number((/"year_auto"\s*:\s*(\d{4})/.exec(html) || [])[1]) || null,
    school: LIB.schoolNameFromHtml(html),
    at: Date.now(),
  };
  return session;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function forwardPost(request, env, path, search) {
  const body = await request.json();
  if (!body || !Array.isArray(body.__args)) return json({ error: 'Zły format zapytania' }, 400);
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await getSession(env, attempt > 0);
    const res = await fetch(base(env) + path + search, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': UA,
        Referer: base(env) + '/timetable/',
        'X-Requested-With': 'XMLHttpRequest',
        ...(s.cookie ? { Cookie: s.cookie } : {}),
      },
      body: JSON.stringify({ __args: body.__args, __gsh: s.gsh }),
    });
    if (res.ok || attempt > 0) {
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
    }
  }
  return json({ error: 'EduPage nie odpowiada' }, 502);
}

function warsawToday() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
}

function ttlFor(func, args) {
  if (func === 'mainDBIAccessor') return 12 * 3600;
  if (func === 'getSubstViewerDayDataHtml') {
    const date = args && args[1] && args[1].date;
    return date && date < warsawToday() ? 6 * 3600 : 3 * 60;
  }
  return 30 * 60;
}

function cacheApi() {
  try { return typeof caches !== 'undefined' && caches.default ? caches.default : null; } catch (_) { return null; }
}

async function upstreamPost(env, path, func, args) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await getSession(env, attempt > 0);
    const res = await fetch(`${base(env)}${path}?__func=${func}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': UA,
        Referer: base(env) + '/timetable/',
        'X-Requested-With': 'XMLHttpRequest',
        ...(s.cookie ? { Cookie: s.cookie } : {}),
      },
      body: JSON.stringify({ __args: args, __gsh: s.gsh }),
    });
    const text = await res.text();
    if (res.ok && /^\s*\{\s*"r"\s*:/.test(text)) return text;
    if (attempt > 0) throw new Error(`EduPage odpowiedział ${res.status}`);
  }
  throw new Error('EduPage nie odpowiada');
}

async function forwardGet(request, env, ctx, path, url) {
  const func = url.searchParams.get('__func') || '';
  let args;
  try { args = JSON.parse(url.searchParams.get('args') || 'null'); } catch (_) { args = null; }
  if (!Array.isArray(args)) return json({ error: 'Zły format zapytania' }, 400);
  const ttl = ttlFor(func, args);
  const cache = cacheApi();

  const keyUrl = `https://${schoolId(env) || 'test'}.plan-cache.internal${path}?__func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  const key = new Request(keyUrl, { method: 'GET' });
  const staleKey = new Request(keyUrl + '&_stale=1', { method: 'GET' });
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  try {
    const text = await upstreamPost(env, path, func, args);
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${ttl}` };
    const res = new Response(text, { headers });
    if (cache) {
      const work = Promise.all([
        cache.put(key, new Response(text, { headers })),
        cache.put(staleKey, new Response(text, { headers: { ...headers, 'Cache-Control': 'public, max-age=1209600' } })),
      ]).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
    }
    return res;
  } catch (e) {
    const old = cache ? await cache.match(staleKey) : null;
    if (old) return new Response(old.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Plan-Stale': '1' } });
    return json({ error: e.message }, 502);
  }
}

function serveStatic(pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  let f = STATIC[p];
  if (!f && !/\.[a-z0-9]+$/i.test(p)) f = STATIC['/index.html'];
  if (!f) return new Response('Nie znaleziono', { status: 404 });
  const bodyData = f.b64 ? Uint8Array.from(atob(f.body), (c) => c.charCodeAt(0)) : f.body;
  const noCache = p.endsWith('.html') || p === '/sw.js';
  return new Response(bodyData, { headers: { 'Content-Type': f.type, 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=300' } });
}

export default {
  async scheduled(event, env, ctx) {
    const work = runCron(env, event && event.scheduledTime).catch((e) => console.log('cron error', e && e.message));
    if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      if (p === '/ep/session') {
        const s = await getSession(env, url.searchParams.get('refresh') === '1');
        return new Response(JSON.stringify({ year: s.year, school: s.school, edupage: schoolId(env) }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
      }
      if (p === '/ep/probe') {
        if (schoolId(env)) return json({ error: 'Szkoła jest już ustawiona.' }, 403);
        const id = LIB.normalizeEdupage(url.searchParams.get('edupage'));
        if (!id) return json({ error: 'To nie jest adres EduPage.' }, 400);
        const res = await fetch(`https://${id}.edupage.org/timetable/`, { headers: { 'User-Agent': UA } });
        const html = res.ok ? await res.text() : '';
        if (!res.ok || !/ASC\.|edupage/i.test(html)) return json({ error: `nie znaleziono ${id}.edupage.org` }, 404);
        return json({ ok: true, school: LIB.schoolNameFromHtml(html) });
      }
      if (p.startsWith('/ep/') && request.method === 'GET' && ALLOWED_POST.has(p.slice(3))) {
        const func = url.searchParams.get('__func') || '';
        if (!ALLOWED_FUNC.test(func)) return json({ error: 'Niedozwolony adres' }, 403);
        return forwardGet(request, env, ctx, p.slice(3), url);
      }
      if (p.startsWith('/ep/') && request.method === 'POST') {
        const path = p.slice(3);
        const func = url.searchParams.get('__func') || '';
        if (!ALLOWED_POST.has(path) || !ALLOWED_FUNC.test(func)) return json({ error: 'Niedozwolony adres' }, 403);
        return forwardPost(request, env, path, url.search);
      }
      if (p === '/ep/substitution/' && request.method === 'GET') {
        const date = url.searchParams.get('date') || '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Zła data' }, 400);
        const res = await fetch(`${base(env)}/substitution/?date=${date}`, { headers: { 'User-Agent': UA } });
        return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      if (p.startsWith('/ep/')) return json({ error: 'Niedozwolony adres' }, 403);
      if (p.startsWith('/push/')) return pushRoute(request, env, url);
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Metoda niedozwolona', { status: 405 });
      return serveStatic(p);
    } catch (e) {
      if (e && e.code === 'NOT_CONFIGURED') return json({ error: 'Nie ustawiono adresu EduPage szkoły (zmienna EDUPAGE w ustawieniach Workera).', code: 'NOT_CONFIGURED' }, 503);
      return json({ error: e.message || String(e) }, 502);
    }
  },
};
