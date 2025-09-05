(() => {
   // === Utils ===
   const debounce = (fn, d = 90) => {
      let t;
      return (...a) => {
         clearTimeout(t);
         t = setTimeout(() => fn(...a), d);
      };
   };
   const isPortrait = () => window.matchMedia('(orientation: portrait)').matches;

   const afterFrames = (n, cb) => {
      const step = () => (--n <= 0 ? cb() : requestAnimationFrame(step));
      requestAnimationFrame(step);
   };

   // Usa visualViewport si existe (mejor señal en iPadOS)
   const getVWVH = () => {
      const vv = window.visualViewport;
      if (vv) return { w: Math.round(vv.width), h: Math.round(vv.height) };
      return { w: window.innerWidth, h: window.innerHeight };
   };

   // Espera a que el viewport esté "calmo" N frames seguidos (con tolerancia)
   const waitViewportCalm = (cb, stableFrames = 2, tol = 2) => {
      let { w, h } = getVWVH(),
         ok = 0;
      const tick = () => {
         const { w: nw, h: nh } = getVWVH();
         if (Math.abs(nw - w) <= tol && Math.abs(nh - h) <= tol) ok++;
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

   const setVH = () => {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
   };

   // Flip súper liviano: re-eval media queries sin tocar href ni bajar archivos
   const flipLinks = () => {
      document.querySelectorAll('link[rel~="stylesheet"]').forEach((link) => {
         const prev = link.media;
         link.media = 'not all';
         void document.documentElement.offsetWidth; // reflow
         link.media = prev || 'all';
      });
   };

   // Nudge a <style> inline sólo en el pass final (evita trabajo extra en fast-path)
   const nudgeInlineStyles = () => {
      document.querySelectorAll('style').forEach((style) => {
         style.textContent = style.textContent + ' ';
      });
   };

   // Secuencia rápida + estable: inmediato y luego afinado
   let rotating = false;
   let lastPortrait = isPortrait();

   const fastPass = () => {
      // Fast-path: aplica YA para que el usuario lo sienta instantáneo
      setVH();
      flipLinks();
      // Reforzá con un segundo flip tras 2 frames (más suave que esperar 200ms)
      afterFrames(2, flipLinks);
   };

   const finalPass = () => {
      waitViewportCalm(
         () => {
            setVH();
            flipLinks();
            nudgeInlineStyles(); // sólo aquí, cuando todo está estable
            rotating = false;
         },
         3,
         2
      );
   };

   const onRotateMaybe = () => {
      const nowPortrait = isPortrait();
      if (nowPortrait === lastPortrait || rotating) return;
      rotating = true;
      lastPortrait = nowPortrait;
      fastPass(); // inmediato
      finalPass(); // afinado breve
   };

   // Listeners
   if (window.visualViewport) {
      visualViewport.addEventListener('resize', debounce(setVH, 50), { passive: true });
   }
   window.addEventListener('orientationchange', onRotateMaybe, { passive: true });
   window.addEventListener('resize', debounce(onRotateMaybe, 80), { passive: true });

   // Inicial
   setVH();
})();
