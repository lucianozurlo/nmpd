// videoObserver.js
document.addEventListener ('DOMContentLoaded', () => {
  console.log ('DOM completamente cargado y parseado.');

  const videoRestart = document.getElementById ('wellted-selfcleaning');

  if (!videoRestart) {
    console.warn (
      "No se encontró el elemento 'wellted-selfcleaning' en el DOM."
    );
    return; // Salir si no hay video
  } else {
    console.log ('Elemento de video encontrado:', videoRestart);
  }

  // Opciones del IntersectionObserver
  const options = {
    root: null, // Observa el viewport
    rootMargin: '0px',
    threshold: 0.5, // 50% del video visible
  };

  let isVisible = false;

  // Crear el IntersectionObserver
  const observer = new IntersectionObserver (entries => {
    entries.forEach (entry => {
      if (entry.isIntersecting) {
        console.log ('El video es visible en el viewport.');
        videoRestart.currentTime = 0;
        videoRestart
          .play ()
          .then (() => {
            console.log ('El video ha comenzado a reproducirse.');
          })
          .catch (error => {
            console.error ('Error al intentar reproducir el video:', error);
          });
      } else {
        console.log ('El video está fuera del viewport.');
        videoRestart.pause ();
        videoRestart.currentTime = 0;
      }
    });
  }, options);

  // Observar el video
  observer.observe (videoRestart);
  console.log ('IntersectionObserver creado y observando el video.');
});
