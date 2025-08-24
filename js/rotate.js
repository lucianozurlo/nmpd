(() => {
   const debounce = (fn, delay = 250) => {
      let t;
      return (...args) => {
         clearTimeout(t);
         t = setTimeout(() => fn(...args), delay);
      };
   };

   // 1) Soft refresh: re-evaluar styles sin red
   const softRefreshCSS = () => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
         try {
            const prevMedia = link.media || 'all';
            link.media = 'print'; // fuerza re-evaluación
            void link.offsetWidth; // trigger reflow
            link.media = prevMedia;
         } catch (e) {
            /* noop */
         }
      });
   };

   // 2) Hard refresh: cache-bust de cada hoja
   const hardRefreshCSS = () => {
      document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
         const href = link.getAttribute('href');
         if (!href) return;
         const base = href.split('#')[0].split('?')[0];
         const q = href.includes('?') ? '&' : '?';
         // reemplazo seguro para evitar que quede creciendo el query
         link.setAttribute('href', `${base}${q}o=${Date.now()}`);
      });
   };

   // 3) (Opcional) fix para 100vh en iOS
   const updateVHVar = () => {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
   };

   const onOrientationChanged = debounce(() => {
      // iOS a veces tarda un tick en ajustar innerWidth/innerHeight
      requestAnimationFrame(() => {
         softRefreshCSS();
         // fallback duro si el soft no alcanza
         setTimeout(hardRefreshCSS, 400);
         updateVHVar();
      });
   }, 200);

   // Listeners confiables en iPadOS
   const mq = window.matchMedia && window.matchMedia('(orientation: portrait)');
   if (mq && mq.addEventListener) mq.addEventListener('change', onOrientationChanged);
   else if (mq && mq.addListener) mq.addListener(onOrientationChanged); // iOS viejo

   window.addEventListener('orientationchange', onOrientationChanged, { passive: true });
   window.addEventListener('resize', onOrientationChanged, { passive: true });

   // Inicial (por si entrás ya rotado)
   updateVHVar();
})();
