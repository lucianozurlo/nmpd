(() => {
   const isPortrait = () => matchMedia('(orientation: portrait)').matches;
   const setVH = () => {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
   };

   // Clona un <link> (mismo href y attrs), espera load/timeout y luego quita el viejo.
   const twinLink = (oldLink) =>
      new Promise((resolve) => {
         // Sólo hojas con href
         const href = oldLink.getAttribute('href');
         if (!href) return resolve();

         const nu = document.createElement('link');
         for (const { name, value } of Array.from(oldLink.attributes)) {
            if (name === 'rel') continue; // lo seteamos abajo
            nu.setAttribute(name, value);
         }
         nu.setAttribute('rel', 'stylesheet');

         let settled = false;
         const done = () => {
            if (settled) return;
            settled = true;
            oldLink.remove();
            resolve();
         };
         nu.addEventListener('load', done, { once: true });
         nu.addEventListener('error', done, { once: true });
         setTimeout(done, 400); // respaldo corto, mantiene fluidez

         oldLink.parentNode.insertBefore(nu, oldLink.nextSibling);
      });

   const twinAllStyles = async () => {
      const links = Array.from(document.querySelectorAll('link[rel~="stylesheet"][href]'));
      if (!links.length) return;
      await Promise.all(links.map(twinLink));
      // “Nudge” a <style> inline para re-evaluar sin deshabilitar
      document.querySelectorAll('style').forEach((s) => (s.textContent += ' '));
   };

   // Overlay sutil (fallback cuando no hay View Transitions)
   const withOverlay = async (fn) => {
      const o = document.createElement('div');
      o.style.cssText = `
      position:fixed;inset:0;pointer-events:none;opacity:0;
      transition:opacity 120ms ease;
      background: rgba(0,0,0,0.02); /* casi imperceptible */
    `;
      document.body.appendChild(o);
      requestAnimationFrame(() => (o.style.opacity = '1'));

      try {
         await fn();
      } finally {
         o.style.opacity = '0';
         o.addEventListener('transitionend', () => o.remove(), { once: true });
      }
   };

   let rotating = false,
      lastPortrait = isPortrait();

   const doSwap = async () => {
      document.documentElement.classList.add('rotating'); // congela scroll, etc.
      setVH();
      await twinAllStyles();
      requestAnimationFrame(() => {
         document.documentElement.classList.remove('rotating');
         rotating = false;
      });
   };

   const runRotation = async () => {
      if (rotating) return;
      rotating = true;

      // Si hay View Transitions, usamos snapshot del frame anterior
      if (document.startViewTransition) {
         await document.startViewTransition(() => doSwap()).finished;
      } else {
         await withOverlay(doSwap);
      }
   };

   const onMaybeRotate = () => {
      const now = isPortrait();
      if (now === lastPortrait) return;
      lastPortrait = now;
      runRotation();
   };

   // Listeners
   if (window.visualViewport) {
      visualViewport.addEventListener('resize', () => setVH(), { passive: true });
   }
   window.addEventListener('orientationchange', onMaybeRotate, { passive: true });
   window.addEventListener('resize', onMaybeRotate, { passive: true });

   // Inicial
   setVH();
})();
