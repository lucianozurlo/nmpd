/* Lock VH only for MOBILE + PORTRAIT (iOS/Android) — single-shot, pre-paint */
(function () {
   try {
      // --- Heurística móvil cross-browser (iOS/Android, incl. iPad con "Desktop mode") ---
      var ua = navigator.userAgent || '';
      var isUAAndroid = /Android/i.test(ua);
      var isUAIphone = /iPhone/i.test(ua);
      var isUAIpad = /iPad/i.test(ua); // por si no está en modo desktop
      var isUAMobi = /Mobi/i.test(ua); // genérico
      var hasTouch = (navigator.maxTouchPoints || 0) > 0;
      var narrowSide = Math.min(screen.width || 0, screen.height || 0); // px de dispositivo

      // móvil si UA lo indica O si hay touch y el lado corto es <= 1024 (tablets incluidas)
      var isMobile =
         isUAAndroid || isUAIphone || isUAIpad || isUAMobi || (hasTouch && narrowSide <= 1024);

      // solo portrait
      var isPortrait =
         (window.matchMedia && matchMedia('(orientation: portrait)').matches) ||
         window.orientation === 0 ||
         window.orientation === 180; // fallback iOS viejo

      if (!isMobile || !isPortrait) return; // no hacer nada si no cumple

      // Alto real del viewport (visualViewport da la medida visible real en móviles)
      var H = Math.max(
         200,
         Math.round((window.visualViewport ? visualViewport.height : window.innerHeight) || 0)
      );

      // Inyectar CSS con valores fijos (¡sin var(--vh)!)
      var css =
         'body.device-mobile.orientation-portrait #main.project-detail.detail-project #hero.has-image #hero-caption{' +
         'max-height:' +
         H +
         'px !important;' +
         '}' +
         '#main.project-detail.detail-project #hero.has-image #hero-caption{' +
         'height:' +
         H +
         'px !important;' +
         '}';

      var style = document.createElement('style');
      style.setAttribute('data-lock-vh-mobile-portrait', 'true');
      style.appendChild(document.createTextNode(css));

      var head = document.head || document.getElementsByTagName('head')[0];
      head.insertBefore(style, head.firstChild);

      // (opcional) marca para debug
      document.documentElement.setAttribute('data-vh-lock', H + 'px');
   } catch (e) {
      /* silent */
   }
})();
