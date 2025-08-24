(() => {
   // --- utilidades ---
   const debounce = (fn, d = 200) => {
      let t;
      return (...a) => {
         clearTimeout(t);
         t = setTimeout(() => fn(...a), d);
      };
   };
   const isPortrait = () => window.matchMedia('(orientation: portrait)').matches;

   // Espera a que innerWidth/innerHeight queden estables N frames seguidos
   const waitViewportStable = (cb, stableFrames = 6) => {
      let w = window.innerWidth,
         h = window.innerHeight,
         ok = 0;
      const tick = () => {
         const nw = window.innerWidth,
            nh = window.innerHeight;
         if (nw === w && nh === h) {
            ok++;
         } else {
            w = nw;
            h = nh;
            ok = 0;
         }
         if (ok >= stableFrames) cb();
         else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
   };

   // Reinyecta <link rel="stylesheet"> con cache-bust + re-eval <style>
   const reloadStylesheets = () => {
      // 1) <link rel="stylesheet">
      document.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => {
         const clone = link.cloneNode(true);
         const href = link.getAttribute('href');
         if (href) {
            const base = href.split('#')[0].split('?')[0];
            const q = href.includes('?') ? '&' : '?';
            clone.setAttribute('href', `${base}${q}o=${Date.now()}`);
         }
         clone.media = 'all';
         link.replaceWith(clone);
      });

      // 2) <style> inline (Webpack/Vite inyectan muchos)
      document.querySelectorAll('style').forEach((style) => {
         style.disabled = true;
         void style.offsetWidth; // reflow
         style.disabled = false;
      });

      // 3) fix 100vh en iOS
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
   };

   // Fallback extremo: recargar página si todo falla
   const hardReloadIfStubborn = () => {
      setTimeout(() => {
         // activalo si realmente lo necesitás:
         // location.reload();
      }, 900);
   };

   let lastPortrait = isPortrait();

   const onMaybeRotate = debounce(() => {
      const nowPortrait = isPortrait();
      if (nowPortrait === lastPortrait) return; // no cambió orientación
      lastPortrait = nowPortrait;

      // Esperar a que el viewport termine de acomodarse y luego recargar CSS
      waitViewportStable(() => {
         reloadStylesheets();
         // descomentar si necesitás ser ultra-agresivo:
         // hardReloadIfStubborn();
      });
   }, 120);

   // Escuchas "reales" de iPadOS
   if (window.visualViewport) {
      visualViewport.addEventListener('resize', onMaybeRotate, { passive: true });
   }
   window.addEventListener('orientationchange', onMaybeRotate, { passive: true });
   window.addEventListener('resize', onMaybeRotate, { passive: true });

   // set inicial de --vh
   document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
})();
