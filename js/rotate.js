(() => {
   // --- utils ---
   const debounce = (fn, d = 200) => {
      let t;
      return (...a) => {
         clearTimeout(t);
         t = setTimeout(() => fn(...a), d);
      };
   };
   const isPortrait = () => window.matchMedia('(orientation: portrait)').matches;

   const setVH = () => {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
   };

   // Espera a que innerWidth/innerHeight queden estables N frames seguidos
   const waitViewportStable = (cb, stableFrames = 6) => {
      let w = window.innerWidth,
         h = window.innerHeight,
         ok = 0;
      const tick = () => {
         const nw = window.innerWidth,
            nh = window.innerHeight;
         if (nw === w && nh === h) ok++;
         else {
            w = nw;
            h = nh;
            ok = 0;
         }
         if (ok >= stableFrames) cb();
         else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
   };

   // Swap seguro de un <link rel="stylesheet"> esperando load (con timeout)
   const swapLink = (oldLink) =>
      new Promise((resolve) => {
         const href = oldLink.getAttribute('href');
         if (!href) return resolve();

         // Siempre partir del href "base" (sin query/hash) y bustear caché
         const base = href.split('#')[0].split('?')[0];
         const q = href.includes('?') ? '&' : '?';
         const bust = `${base}${q}o=${Date.now()}`;

         const newLink = document.createElement('link');

         // Copiar TODOS los atributos excepto href/rel (no toques media/origin/etc.)
         for (const { name, value } of Array.from(oldLink.attributes)) {
            if (name === 'href' || name === 'rel') continue;
            newLink.setAttribute(name, value);
         }
         newLink.setAttribute('rel', 'stylesheet');
         newLink.setAttribute('href', bust);

         let done = false;
         const finish = () => {
            if (done) return;
            done = true;
            // Remover el viejo sólo cuando el nuevo esté listo (o al timeout)
            oldLink.remove();
            resolve();
         };

         newLink.addEventListener('load', finish, { once: true });
         newLink.addEventListener('error', finish, { once: true });
         // Fallback por si Safari nunca dispara 'load' (caso real en rotaciones repetidas)
         const t = setTimeout(finish, 2000);

         // Insertar el nuevo al lado del viejo para evitar FOUC
         oldLink.parentNode.insertBefore(newLink, oldLink.nextSibling);
      });

   // Re-evaluar <style> inline (sin deshabilitar) para evitar que queden “pegados”
   const reEvalInlineStyles = () => {
      document.querySelectorAll('style').forEach((style) => {
         // Nudge sin modificar reglas efectivas (espacio al final)
         style.textContent = style.textContent + ' ';
      });
   };

   // Recarga robusta de hojas de estilo (sin carreras)
   let reloading = false;
   let lastReloadAt = 0;
   const reloadStylesheets = async () => {
      if (reloading) return;
      reloading = true;

      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));
      // Swap en paralelo y esperar a todos
      await Promise.all(links.map(swapLink));

      reEvalInlineStyles();
      setVH();

      lastReloadAt = Date.now();
      reloading = false;
   };

   // Fallback extremo: si en 3 s no se aplicó nada, una vez forzar reload dura
   let hardReloadUsed = false;
   const fallbackHardReload = () => {
      if (!hardReloadUsed && Date.now() - lastReloadAt > 3000) {
         hardReloadUsed = true;
         location.reload();
      }
   };

   let lastPortrait = isPortrait();

   const onMaybeRotate = debounce(() => {
      const nowPortrait = isPortrait();
      if (nowPortrait === lastPortrait) return; // sin cambio real de orientación
      lastPortrait = nowPortrait;

      // Esperar a que el viewport deje de “bailar” y recargar CSS de forma segura
      waitViewportStable(async () => {
         await reloadStylesheets();
         // Si Safari se hace el vivo y no aplicó, fallback (una sola vez)
         setTimeout(fallbackHardReload, 1200);
      });
   }, 140);

   // Escuchas reales en iPadOS
   if (window.visualViewport) {
      visualViewport.addEventListener(
         'resize',
         debounce(() => {
            setVH();
         }, 80),
         { passive: true }
      );
   }

   window.addEventListener('orientationchange', onMaybeRotate, { passive: true });
   window.addEventListener('resize', onMaybeRotate, { passive: true });

   // Inicial
   setVH();
})();
