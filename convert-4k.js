// convert-4k.js - v6 (multi-salida: responsive-4k.css + projects-4k.css)
// - Npx -> calc(var(--vwScale) * N) con --vwScale = 100vw / VW_REF (proporcional real)
// - Solo incluye reglas globales o en @media con SOLO min-width (sin max-width/orientation/etc.)
// - Dedup: gana el mayor min-width; a igualdad, el último en orden
// - Ignora letter-spacing y 0/0px; no entra a url()/var()/calc()
// - Soporta @keyframes (emite steps con px>0 convertidos)

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

// === Configuración ===
const VW_REF = 1920; // baseline px

// Conjunto base (mismo que antes, SIN projects.css)
const BASE_FILES = [
   'css/content.css',
   'css/showcase.css',
   'css/shortcodes.css',
   'css/assets.css',
   'css/style.css',
   'css/all.min.css',
   'css/custom.css',
   'css/responsive.css',
];

// Salidas
const OUTPUTS = [
   { inputFiles: BASE_FILES, outPath: 'css/responsive-4k.css' },
   { inputFiles: ['css/projects.css'], outPath: 'css/projects-4k.css' },
];

// === Utilidades internas ===
const DROP_PROPS = new Set(['letter-spacing']); // Nunca emitir
const SKIP_FUNCS = new Set(['url', 'var', 'calc']);

function parseMinWidthFromMedia(paramStr) {
   const p = (paramStr || '').trim().toLowerCase();
   if (p.includes(',')) return { isAcceptable: false, maxMinWidth: 0 };

   const forbidden = [
      'max-width',
      'orientation',
      'resolution',
      'device-',
      'hover',
      'any-hover',
      'pointer',
      'any-pointer',
      'aspect-ratio',
   ];
   if (forbidden.some((kw) => p.includes(kw))) {
      return { isAcceptable: false, maxMinWidth: 0 };
   }

   const re = /min-width\s*:\s*(\d+(\.\d+)?)px/g;
   let m,
      max = 0,
      saw = false;
   while ((m = re.exec(p))) {
      saw = true;
      const n = parseFloat(m[1]);
      if (n > max) max = n;
   }
   if (!saw) return { isAcceptable: false, maxMinWidth: 0 };
   return { isAcceptable: true, maxMinWidth: max };
}

function getMediaContext(rule) {
   let node = rule.parent;
   let maxMinWidth = 0;
   while (node) {
      if (node.type === 'atrule' && node.name.toLowerCase() === 'media') {
         const { isAcceptable, maxMinWidth: mmw } = parseMinWidthFromMedia(node.params);
         if (!isAcceptable) return { ok: false, minWidthRank: 0 };
         if (mmw > maxMinWidth) maxMinWidth = mmw;
      }
      node = node.parent;
   }
   return { ok: true, minWidthRank: maxMinWidth }; // 0 si global
}

function convertValuePx(value) {
   // px>0 → calc(var(--vwScale) * N)
   let touched = false;
   const ast = valueParser(value);

   function walk(n) {
      if (n.type === 'function') {
         const fn = (n.value || '').toLowerCase();
         if (SKIP_FUNCS.has(fn)) return;
         n.nodes.forEach(walk);
         return;
      }
      if (n.type === 'word') {
         const m = n.value.match(/^(-?\d*\.?\d+)px$/i);
         if (m) {
            const num = parseFloat(m[1]);
            if (!Number.isNaN(num) && num !== 0) {
               n.value = `calc(var(--vwScale) * ${num})`;
               touched = true;
            }
         }
      }
   }

   ast.walk(walk);
   return { value: ast.toString(), touched };
}

function collectIncludedDecls(rule) {
   const out = [];
   rule.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase();
      if (DROP_PROPS.has(prop)) return;
      if (!/px\b/i.test(decl.value)) return;

      const { value, touched } = convertValuePx(decl.value);
      if (!touched) return; // tenía px pero todos 0

      out.push({ prop: decl.prop, value, important: decl.important });
   });
   return out;
}

function declsToText(decls) {
   return decls
      .map((d) => `${d.prop}: ${d.value}${d.important ? ' !important' : ''};`)
      .join('\n    ');
}

function readCssIfExists(file) {
   const abs = path.resolve(file);
   if (!fs.existsSync(abs)) return null;
   return fs.readFileSync(abs, 'utf8');
}

function buildHeader() {
   return `@media (min-width: 1921px) {
  :root { --vwRef: ${VW_REF}; --vwScale: calc(100vw / var(--vwRef)); }

`;
}

// === Proceso por salida ===
function build4k({ inputFiles, outPath }) {
   // winners: selector -> prop -> {value, important, rank, order}
   const winners = new Map();
   let orderCounter = 0;
   const keyframesOut = [];

   for (const file of inputFiles) {
      const css = readCssIfExists(file);
      if (!css) continue;

      const root = postcss.parse(css, { from: file });

      // Reglas normales
      root.walkRules((rule) => {
         if (rule.parent && rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) {
            return; // steps de keyframes se procesan abajo
         }
         const ctx = getMediaContext(rule);
         if (!ctx.ok) return;

         const decls = collectIncludedDecls(rule);
         if (decls.length === 0) return;

         const sel = rule.selector;
         if (!winners.has(sel)) winners.set(sel, new Map());
         const perProp = winners.get(sel);

         for (const d of decls) {
            const candidate = {
               value: d.value,
               important: d.important,
               rank: ctx.minWidthRank,
               order: ++orderCounter,
            };
            const prev = perProp.get(d.prop);
            if (
               !prev ||
               candidate.rank > prev.rank ||
               (candidate.rank === prev.rank && candidate.order > prev.order)
            ) {
               perProp.set(d.prop, candidate);
            }
         }
      });

      // @keyframes
      root.walkAtRules((at) => {
         if (!/keyframes$/i.test(at.name)) return;
         const name = at.params;
         const steps = [];
         at.walkRules((step) => {
            const decls = collectIncludedDecls(step);
            if (decls.length > 0) {
               steps.push(`${step.selector} {\n    ${declsToText(decls)}\n  }`);
            }
         });
         if (steps.length > 0) {
            keyframesOut.push(`@${at.name} ${name} {\n  ${steps.join('\n\n  ')}\n}`);
         }
      });
   }

   // Armar reglas finales por selector
   const rulesOut = [];
   for (const [sel, perProp] of winners.entries()) {
      const decls = [];
      for (const [prop, data] of perProp.entries()) {
         decls.push({ prop, value: data.value, important: data.important, order: data.order });
      }
      decls.sort((a, b) => a.order - b.order);
      rulesOut.push(`${sel} {\n    ${declsToText(decls)}\n  }`);
   }

   const header = buildHeader();
   const body = rulesOut.join('\n\n');
   const kf = keyframesOut.length ? `\n\n${keyframesOut.join('\n\n')}\n` : '\n';
   const footer = `}\n`;

   fs.writeFileSync(path.resolve(outPath), header + body + kf + footer, 'utf8');
   console.log(`✔ Generado: ${outPath}`);
}

// === Main ===
(function run() {
   for (const job of OUTPUTS) {
      build4k(job);
   }
   console.log('Escala proporcional: Npx → calc(var(--vwScale) * N) (baseline %dpx).', VW_REF);
   console.log('Cargá projects-4k.css ANTES de responsive-4k.css.');
})();
