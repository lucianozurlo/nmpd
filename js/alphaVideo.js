(function () {
   const vid = document.getElementById('alphaVideo');

   Object.assign(vid, {
      muted: true,
      defaultMuted: true,
      playsInline: true,
   });
   vid.setAttribute('playsinline', '');
   vid.setAttribute('webkit-playsinline', '');

   const attemptPlay = () => {
      const p = vid.play();
      if (p) {
         p.catch(() => {
            const unlock = () => {
               vid.play();
               window.removeEventListener('touchstart', unlock, true);
            };
            window.addEventListener('touchstart', unlock, {
               once: true,
               passive: true,
               capture: true,
            });
         });
      }
   };

   if (document.readyState !== 'loading') attemptPlay();
   else document.addEventListener('DOMContentLoaded', attemptPlay);
})();
