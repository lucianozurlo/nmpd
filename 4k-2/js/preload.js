console.log('release 1');

function preloadImages(imagePaths) {
   return Promise.all(
      imagePaths.map((path) => {
         return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
               console.log(`Imagen precargada: ${path}`);
               resolve();
            };
            img.onerror = () => {
               console.error(`Error al precargar la imagen: ${path}`);
               reject(`Error al cargar la imagen: ${path}`);
            };
         });
      })
   );
}

function preloadVideos(videoPaths) {
   return Promise.all(
      videoPaths.map((path) => {
         return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = path;
            video.preload = 'auto';
            video.onloadeddata = () => {
               console.log(`Video precargado: ${path}`);
               resolve();
            };
            video.onerror = () => {
               console.error(`Error al precargar el video: ${path}`);
               reject(`Error al cargar el video: ${path}`);
            };
         });
      })
   );
}

function getPageName() {
   const path = window.location.pathname;
   console.log(`path es "${path}"`);

   const cleanPath = path.replace(/^\/+|\/+$/g, '');

   const pageName = cleanPath.split('/').pop();

   console.log(`pageName es "${pageName}"`);

   return pageName;
}

function loadSequenceImages(prefix, start, end, pageName) {
   const paths = [];
   for (let i = start; i <= end; i++) {
      const paddedIndex = String(i).padStart(2, '0');
      paths.push(`./_img/seq/${prefix}${paddedIndex}.png`);
   }
   return paths;
}

function loadImagesForPage(pageName) {
   const jsonPath = `${window.location.pathname}/_json/${pageName}.json`;

   console.log(`Ruta al JSON: ${jsonPath}`);

   fetch(jsonPath)
      .then((response) => {
         if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo JSON: ${jsonPath}`);
         }
         return response.json();
      })
      .then((data) => {
         const seqPaths = data.seq
            ? data.seq.flatMap((seq) =>
                 loadSequenceImages(seq.prefix, seq.start, seq.end, pageName)
              )
            : [];

         const vidPaths = data.vid ? data.vid.map((video) => `./_vid/${video}`) : [];

         const introPaths = data.intro ? data.intro.map((image) => `./_img/intro/${image}`) : [];

         const allPaths = [...seqPaths, ...introPaths];
         const allVideos = [...vidPaths];

         return Promise.all([preloadImages(allPaths), preloadVideos(allVideos)]);
      })
      .then(() => {
         console.log('Todas las imágenes y videos fueron precargados correctamente');
      })
      .catch((error) => {
         console.error('Error al precargar imágenes, videos o cargar el JSON:', error);
      });
}

const pageName = getPageName();
loadImagesForPage(pageName);
