(function () {
   const qs = new URLSearchParams(location.search);
   const forceOn = qs.has('force1080'); // ?force1080
   const forceOff = qs.has('no1080'); // ?no1080

   function is4kAt100() {
      const dpr = window.devicePixelRatio || 1;
      const sw = window.screen.width;
      const sh = window.screen.height;
      const max = Math.max(sw, sh);
      const min = Math.min(sw, sh);
      // 4K “real” a 100% (sin escala del SO): 3840×2160 y DPR=1
      return dpr === 1 && max >= 3840 && min >= 2160;
   }

   if ((is4kAt100() || forceOn) && !forceOff) {
      document.documentElement.classList.add('force1080');
      document.documentElement.setAttribute('data-scale', '2');
   }

   // (Opcional) si cambiás el navegador de monitor, podés re-evaluar:
   window.addEventListener('resize', () => {
      if (!forceOn && !forceOff) {
         if (is4kAt100()) {
            document.documentElement.classList.add('force1080');
         } else {
            document.documentElement.classList.remove('force1080');
         }
      }
   });
})();
