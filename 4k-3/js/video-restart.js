document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM completamente cargado y parseado.');

   const videoRestart = document.getElementById('wellted-selfcleaning');

   if (!videoRestart) {
      console.warn("No se encontró el elemento 'wellted-selfcleaning' en el DOM.");
      return;
   } else {
      console.log('Elemento de video encontrado:', videoRestart);
   }

   const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
   };

   let isVisible = false;

   const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            console.log('El video es visible en el viewport.');
            videoRestart.currentTime = 0;
            videoRestart
               .play()
               .then(() => {
                  console.log('El video ha comenzado a reproducirse.');
               })
               .catch((error) => {
                  console.error('Error al intentar reproducir el video:', error);
               });
         } else {
            console.log('El video está fuera del viewport.');
            videoRestart.pause();
            videoRestart.currentTime = 0;
         }
      });
   }, options);

   observer.observe(videoRestart);
   console.log('IntersectionObserver creado y observando el video.');
});
