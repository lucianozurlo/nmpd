// videoObserver.js
document.addEventListener ('DOMContentLoaded', () => {
  const videoRestart = document.getElementById ('video-restart');

  if (!videoRestart) {
    console.warn ("No se encontró el elemento 'video-restart' en el DOM.");
    return; // Salir si no hay video
  }

  // Crear el IntersectionObserver
  const observer = new IntersectionObserver (entries => {
    entries.forEach (entry => {
      if (entry.isIntersecting) {
        console.log ('El video es visible en el viewport.');
        videoRestart.currentTime = 0; // Reiniciar el video
        videoRestart.play ().catch (error => {
          console.error ('Error al intentar reproducir el video:', error);
        });
      } else {
        console.log ('El video está fuera del viewport.');
        videoRestart.pause ();
        videoRestart.currentTime = 0; // Reiniciar el video cuando no esté visible
      }
    });
  });

  // Observar el video
  observer.observe (videoRestart);
});
