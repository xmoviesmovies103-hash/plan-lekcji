const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mods = ['html', 'substitutions', 'timetable', 'edupage', 'api', 'proxyClient'];
let out = '(function () {\n  var defs = {};\n';
for (const m of mods) {
  const src = fs.readFileSync(path.join(root, 'lib', m + '.js'), 'utf8');
  out += `  defs['./${m}'] = function (module, exports, require) {\n${src}\n};\n`;
}
out += `  var cache = {};
  function req(name) {
    var key = './' + name.replace(/^\\.\\//, '').replace(/\\.js$/, '');
    if (cache[key]) return cache[key].exports;
    if (!defs[key]) throw new Error('plan-lib: missing module ' + name);
    var m = { exports: {} }; cache[key] = m; defs[key](m, m.exports, req); return m.exports;
  }
  self.PlanLib = { createApi: req('./api').createApi, ProxyEduPageClient: req('./proxyClient').ProxyEduPageClient, EduPageClient: req('./edupage').EduPageClient, normalizeEdupage: req('./edupage').normalizeEdupage };
})();
`;
fs.writeFileSync(path.join(root, 'public', 'plan-lib.js'), out);
console.log('public/plan-lib.js', (out.length / 1024).toFixed(0) + ' KB');
