console.log ('release 1');

// Pre-cargar imágenes
function preloadImages (imagePaths) {
  return Promise.all (
    imagePaths.map (path => {
      return new Promise ((resolve, reject) => {
        const img = new Image ();
        img.src = path;
        img.onload = () => {
          console.log (`Imagen precargada: ${path}`);
          resolve ();
        };
        img.onerror = () => {
          console.error (`Error al precargar la imagen: ${path}`);
          reject (`Error al cargar la imagen: ${path}`);
        };
      });
    })
  );
}

// Pre-cargar videos
function preloadVideos (videoPaths) {
  return Promise.all (
    videoPaths.map (path => {
      return new Promise ((resolve, reject) => {
        const video = document.createElement ('video');
        video.src = path;
        video.preload = 'auto'; // Cargar el video automáticamente
        video.onloadeddata = () => {
          console.log (`Video precargado: ${path}`);
          resolve ();
        };
        video.onerror = () => {
          console.error (`Error al precargar el video: ${path}`);
          reject (`Error al cargar el video: ${path}`);
        };
      });
    })
  );
}

// Obtener el nombre de la página
function getPageName () {
  const path = window.location.pathname;
  console.log (`path es "${path}"`);

  // Quitamos las barras al principio y al final
  const cleanPath = path.replace (/^\/+|\/+$/g, '');

  // Extraemos el último segmento después de la última barra
  const pageName = cleanPath.split ('/').pop ();

  console.log (`pageName es "${pageName}"`);

  return pageName;
}

// Cargar las imágenes de una secuencia
function loadSequenceImages (prefix, start, end, pageName) {
  const paths = [];
  for (let i = start; i <= end; i++) {
    const paddedIndex = String (i).padStart (2, '0'); // Pone 01, 02, ..., 10, 11, etc.
    paths.push (`./_img/seq/${prefix}${paddedIndex}.png`);
  }
  return paths;
}

// Cargar las imágenes y videos para la página actual
function loadImagesForPage (pageName) {
  // Utiliza la variable window.location para construir la ruta
  const jsonPath = `${window.location.pathname}/_json/${pageName}.json`;

  console.log (`Ruta al JSON: ${jsonPath}`); // Verifica la ruta

  fetch (jsonPath)
    .then (response => {
      if (!response.ok) {
        throw new Error (`No se pudo cargar el archivo JSON: ${jsonPath}`);
      }
      return response.json ();
    })
    .then (data => {
      // Preparamos las rutas de las secuencias
      const seqPaths = data.seq
        ? data.seq.flatMap (seq =>
            loadSequenceImages (seq.prefix, seq.start, seq.end, pageName)
          )
        : [];

      // Preparamos las rutas de los videos
      const vidPaths = data.vid
        ? data.vid.map (video => `./_vid/${video}`)
        : [];

      // Preparamos las rutas de las imágenes intro
      const introPaths = data.intro
        ? data.intro.map (image => `./_img/intro/${image}`)
        : [];

      // Unimos todas las rutas de imágenes y videos
      const allPaths = [...seqPaths, ...introPaths]; // Solo secuencias e intros
      const allVideos = [...vidPaths];

      // Pre-cargamos imágenes y videos
      return Promise.all ([
        preloadImages (allPaths), // Esta parte ahora solo carga secuencias e intros
        preloadVideos (allVideos),
      ]);
    })
    .then (() => {
      console.log (
        'Todas las imágenes y videos fueron precargados correctamente'
      );
    })
    .catch (error => {
      console.error (
        'Error al precargar imágenes, videos o cargar el JSON:',
        error
      );
    });
}

// Llamar a la función para cargar imágenes y videos para la página actual
const pageName = getPageName ();
loadImagesForPage (pageName);
