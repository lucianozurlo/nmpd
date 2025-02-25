// Función para obtener la ruta de la imagen actual
const getFramePath = (path, index, format) => {
  const frameNumber = String (index).padStart (2, '0');
  return `${path}${frameNumber}${format}`;
};

// Función para cambiar la imagen en función del scroll
const updateImageSequence = (scrollBound, imgElement, totalFrames) => {
  const distanceFromTop =
    window.scrollY + scrollBound.getBoundingClientRect ().top;
  const scrollHeight = scrollBound.scrollHeight - window.innerHeight;
  const scrollProgress = Math.min (
    Math.max ((window.scrollY - distanceFromTop) / scrollHeight, 0),
    1
  );

  const frameIndex = Math.floor (scrollProgress * (totalFrames - 1));
  const newFrame = getFramePath (
    scrollBound.dataset.path,
    frameIndex,
    scrollBound.dataset.format
  );

  imgElement.src = newFrame;
};

// Configurar y manejar múltiples secuencias de imágenes
const initializeSequences = () => {
  const scrollBounds = document.querySelectorAll ('.scroll-bound');

  scrollBounds.forEach (scrollBound => {
    const totalFrames = parseInt (scrollBound.dataset.frames, 10);
    const imgElement = scrollBound.querySelector ('.image-sequence img');

    // Precargar las imágenes para cada secuencia
    const preloadImages = () => {
      const promises = [];
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image ();
        img.src = getFramePath (
          scrollBound.dataset.path,
          i,
          scrollBound.dataset.format
        );
        promises.push (
          new Promise (resolve => {
            img.onload = resolve;
          })
        );
      }
      return Promise.all (promises);
    };

    // Iniciar el preloading y agregar el evento de scroll para cada secuencia
    preloadImages ().then (() => {
      window.addEventListener ('scroll', () =>
        updateImageSequence (scrollBound, imgElement, totalFrames)
      );
    });
  });
};

// Iniciar todas las secuencias
initializeSequences ();
