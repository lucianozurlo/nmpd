(function () {
   const forceCSSRecalc = () => {
      // 👇 Truco 1: cambiar un atributo del <html> para que CSS se reevalúe
      document.documentElement.setAttribute('data-orientation', window.orientation);

      // 👇 Truco 2: forzar un pequeño "reflow"
      document.body.style.display = 'none';
      document.body.offsetHeight; // lee el layout → dispara reflow
      document.body.style.display = '';
   };

   window.addEventListener('orientationchange', () => {
      setTimeout(forceCSSRecalc, 100); // delay para que Safari actualice primero
   });

   // backup: algunos iPads no disparan orientationchange, pero sí resize
   window.addEventListener('resize', () => {
      setTimeout(forceCSSRecalc, 100);
   });
})();
