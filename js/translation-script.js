document.querySelectorAll ('a[data-lang]').forEach (link => {
  link.addEventListener ('click', function (event) {
    event.preventDefault (); // Prevenir el comportamiento por defecto del enlace
    const language = this.getAttribute ('data-lang');

    // Llamar a la función de traducción
    loadTranslations (language);

    // Actualizar las clases de opacidad
    updateLanguageLinks (language);
  });
});

function loadTranslations (language) {
  fetch (`../../langs/${language}.json`)
    .then (response => {
      if (!response.ok) {
        throw new Error ('Network response was not ok');
      }
      return response.json ();
    })
    .then (translations => {
      document.querySelectorAll ('[data-original]').forEach (element => {
        const originalText = element.getAttribute ('data-original');
        if (translations[originalText]) {
          element.textContent = translations[originalText];
          element.setAttribute ('data-hover', translations[originalText]);
        }
      });
    })
    .catch (error => {
      console.error ('There was a problem with the fetch operation:', error);
    });
}

// Función para actualizar la opacidad de los enlaces
function updateLanguageLinks (activeLang) {
  document.querySelectorAll ('a[data-lang]').forEach (link => {
    const language = link.getAttribute ('data-lang');
    if (language === activeLang) {
      link.classList.add ('active'); // Añadir la clase al idioma activo
    } else {
      link.classList.remove ('active'); // Quitar la clase de los inactivos
    }
  });
}

// Establecer idioma por defecto al cargar la página
document.addEventListener ('DOMContentLoaded', () => {
  const defaultLanguage = 'en'; // Idioma por defecto
  loadTranslations (defaultLanguage); // Cargar las traducciones por defecto
  updateLanguageLinks (defaultLanguage); // Actualizar la opacidad de los enlaces
});
