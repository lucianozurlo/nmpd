// convert-vh-inplace.js - v1 (in-place)
// - Modifica tus CSS en sitio: valores con `vh` -> duplica la declaración:
//     1) fallback:  usa --vh  (actualizado por tu JS runtime)
//     2) override:  usa --vh-fix (1dvh si hay soporte)
// - Evita nested calc(): dentro de calc(...) reemplaza "Nvh" por "(var(--vh)*N)" / "(N*var(--vh-fix))"
// - Inyecta cabecera con :root (--vh y --vh-fix) en HEADER_TARGET si no existe
// - Crea backups *.bak-vhfix (una vez)
//
// npm i postcss postcss-value-parser

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const valueParser = require('postcss-value-parser');

// === Config ===
const INPUT_FILES = [
   'css/content.css',
   'css/showcase.css',
   'css/shortcodes.css',
   'css/assets.css',
   'css/style.css',
   'css/all.min.css',
   'css/custom.css',
   'css/projects.css',
];

const HEADER_TARGET = 'css/custom.css'; // dónde inyectar :root vars si no están

// --- Utils ---
function readIfExists(p) {
   const abs = path.resolve(p);
   return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
}
function writeFile(p, txt) {
   fs.writeFileSync(path.resolve(p), txt, 'utf8');
}
function backupOnce(p) {
   const abs = path.resolve(p);
   const bak = abs + '.bak-vhfix';
   if (!fs.existsSync(abs)) return;
   if (!fs.existsSync(bak)) fs.copyFileSync(abs, bak);
}

const SKIP_FUNCS = new Set(['url', 'var']);
function valueHasVh(v) {
   return /\b-?\d*\.?\d+vh\b/i.test(v);
}

function convertValueWithVh(orig) {
   // Devuelve {touched, fallback, override}
   // fallback: reemplaza Nvh por calc(var(--vh) * N) ó (var(--vh)*N) si ya estamos dentro de calc()
   // override: reemplaza Nvh por calc(N * var(--vh-fix)) ó (N*var(--vh-fix)) si dentro de calc()
   let touched = false;

   function convert(mode) {
      const ast = valueParser(orig);

      function walk(nodes, fnStack) {
         for (const node of nodes) {
            if (node.type === 'function') {
               const name = (node.value || '').toLowerCase();
               if (SKIP_FUNCS.has(name)) continue; // no entrar
               fnStack.push(name);
               walk(node.nodes || [], fnStack);
               fnStack.pop();
               continue;
            }
            if (node.type === 'word') {
               const m = /^(-?\d*\.?\d+)vh$/i.exec(node.value);
               if (m) {
                  const nStr = m[1];
                  const n = parseFloat(nStr);
                  if (!Number.isNaN(n) && n !== 0) {
                     touched = true;
                     const inCalc = fnStack.includes('calc');
                     if (mode === 'fallback') {
                        node.value = inCalc
                           ? `(var(--vh)*${stripZeros(n)})`
                           : `calc(var(--vh) * ${stripZeros(n)})`;
                     } else {
                        node.value = inCalc
                           ? `(${stripZeros(n)}*var(--vh-fix))`
                           : `calc(${stripZeros(n)} * var(--vh-fix))`;
                     }
                  }
               }
            }
         }
      }

      walk(ast.nodes || [], []);
      return ast.toString();
   }

   const fallback = convert('fallback');
   const override = convert('override');
   return { touched, fallback, override };
}

function stripZeros(n) {
   const s = String(n);
   return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

function fileHasVhFixHeader(txt) {
   return /--vh-fix\s*:/.test(txt) || /@supports\s*\(height:\s*100dvh\)/i.test(txt);
}

function buildHeaderBlock() {
   return `/* --- vh-fix (auto-inyectado) --- */
:root{
  /* Tu JS setea --vh = innerHeight*0.01 en iOS/iPadOS */
  --vh: 1vh;
  /* --vh-fix será 1dvh si hay soporte; si no, queda en 1vh */
  --vh-fix: 1vh;
}
@supports (height: 100dvh) {
  :root { --vh-fix: 1dvh; }
}

/* fin vh-fix */
`;
}

// === Proceso principal ===
(async function run() {
   let injectedHeader = false;
   let totalFilesChanged = 0;

   for (const file of INPUT_FILES) {
      const css = readIfExists(file);
      if (css == null) continue;

      const root = postcss.parse(css, { from: file });
      let changed = false;

      // Reglas (incluye @keyframes steps porque también son Rules)
      root.walkRules((rule) => {
         rule.walkDecls((decl) => {
            if (!valueHasVh(decl.value)) return;

            const { touched, fallback, override } = convertValueWithVh(decl.value);
            if (!touched) return;

            // Evita re-procesar si ya fue convertido (heurística)
            if (/var\(--vh-fix\)|var\(--vh\)/.test(decl.value)) return;

            // 1) dejamos fallback en la misma declaración
            decl.value = fallback;

            // 2) agregamos override inmediatamente después
            decl.after({
               prop: decl.prop,
               value: override,
               important: decl.important,
            });

            changed = true;
         });
      });

      if (changed) {
         backupOnce(file);
         writeFile(file, root.toResult().css);
         totalFilesChanged++;
         console.log(`✔ Ajustado: ${file}`);
      } else {
         console.log(`= Sin cambios: ${file}`);
      }
   }

   // Inyectar header en HEADER_TARGET si no está
   const headerTargetCss = readIfExists(HEADER_TARGET);
   if (headerTargetCss != null && !fileHasVhFixHeader(headerTargetCss)) {
      backupOnce(HEADER_TARGET);
      writeFile(HEADER_TARGET, buildHeaderBlock() + headerTargetCss);
      injectedHeader = true;
      console.log(`✔ Cabecera vh-fix inyectada en: ${HEADER_TARGET}`);
   } else if (headerTargetCss == null) {
      console.warn(`! HEADER_TARGET no existe: ${HEADER_TARGET} (omitido)`);
   } else {
      console.log(`= Cabecera ya presente en: ${HEADER_TARGET}`);
   }

   console.log('----');
   console.log(
      `Listo. Archivos modificados: ${totalFilesChanged}${injectedHeader ? ' + header' : ''}`
   );
})();
