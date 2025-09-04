(() => {
   const docEl = document.documentElement;

   // --- utilidades livianas ---
   const isPortrait = () => matchMedia('(orientation: portrait)').matches;

   // Un batch por frame para coalescer múltiples eventos (resize, orientationchange, etc.)
   let rafId = null;
   const scheduleApply = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
         rafId = null;
         applyViewportFixes();
      });
   };

   // Recalcula --vh y data-orientation sin recargar CSS
   const applyViewportFixes = () => {
      // Preferí visualViewport.height en iOS; fallback a innerHeight
      const vhSource = window.visualViewport?.height || window.innerHeight;
      docEl.style.setProperty('--vh', vhSource * 0.01 + 'px');
      docEl.setAttribute('data-orientation', isPortrait() ? 'portrait' : 'landscape');
   };

   // Handler rápido, sin esperar “estabilidad” larga
   const onViewportChange = () => {
      // 1) actualización inmediata (coalescida por rAF)
      scheduleApply();

      // 2) actualización “de seguridad” tras un pequeño settling
      //    (Safari iOS a veces ajusta barras tras ~120–200ms)
      clearTimeout(onViewportChange._t);
      onViewportChange._t = setTimeout(applyViewportFixes, 160);
   };

   // Listeners mínimos y rápidos
   if (window.visualViewport) {
      visualViewport.addEventListener('resize', onViewportChange, { passive: true });
   }
   addEventListener('resize', onViewportChange, { passive: true });
   addEventListener('orientationchange', onViewportChange, { passive: true });

   // Set inicial
   applyViewportFixes();
})();
