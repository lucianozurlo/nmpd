(() => {
   // --- utils ---
   const debounce = (fn, d = 180) => {
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

   // Forzar re-evaluación sin red (sin cambiar href)
   const reapplyStyles = () => {
      // 1) “Flip” de media en todos los <link rel="stylesheet">
      document.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => {
         const prev = link.media; // puede ser "" (equivale a "all") o una media query
         link.media = 'not all'; // desactiva
         // reflow forzado
         void link.offsetWidth;
         link.media = prev || 'all'; // reactiva (Safari re-evalúa media queries)
      });

      // 2) Nudge a <style> inline (Webpack/Vite) para re-evaluar sin togglear disabled
      document.querySelectorAll('style').forEach((style) => {
         style.textContent = style.textContent + ' ';
      });

      // 3) Fix 100vh móvil
      setVH();

      // 4) Segundo pase (por si el viewport termina de “acomodarse” tarde)
      setTimeout(() => {
         document.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => {
            const prev = link.media;
            link.media = 'not all';
            void link.offsetWidth;
            link.media = prev || 'all';
         });
         setVH();
      }, 200);
   };

   // (opcional) watchdog: si por algún motivo no hay hojas aplicadas, recarga dura 1 vez
   let hardReloadUsed = false;
   const watchdog = () => {
      try {
         const sheetCount = document.styleSheets.length;
         if (sheetCount === 0 && !hardReloadUsed) {
            hardReloadUsed = true;
            location.reload();
         }
      } catch (_) {
         /* ignore CORS */
      }
   };

   let lastPortrait = isPortrait();

   const onMaybeRotate = debounce(() => {
      const nowPortrait = isPortrait();
      if (nowPortrait === lastPortrait) return;
      lastPortrait = nowPortrait;

      waitViewportStable(() => {
         reapplyStyles();
         setTimeout(watchdog, 900);
      });
   }, 140);

   // Listeners
   if (window.visualViewport) {
      visualViewport.addEventListener('resize', debounce(setVH, 80), { passive: true });
   }
   window.addEventListener('orientationchange', onMaybeRotate, { passive: true });
   window.addEventListener('resize', onMaybeRotate, { passive: true });

   // Inicial
   setVH();
})();
