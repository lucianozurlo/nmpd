document.querySelectorAll('a[data-lang]').forEach((link) => {
   link.addEventListener('click', function (event) {
      event.preventDefault();
      const language = this.getAttribute('data-lang');

      loadTranslations(language);

      updateLanguageLinks(language);
   });
});

function loadTranslations(language) {
   fetch(`../../langs/${language}.json`)
      .then((response) => {
         if (!response.ok) {
            throw new Error('Network response was not ok');
         }
         return response.json();
      })
      .then((translations) => {
         document.querySelectorAll('[data-original]').forEach((element) => {
            const originalText = element.getAttribute('data-original');
            if (translations[originalText]) {
               element.textContent = translations[originalText];
               element.setAttribute('data-hover', translations[originalText]);
            }
         });
      })
      .catch((error) => {
         console.error('There was a problem with the fetch operation:', error);
      });
}

function updateLanguageLinks(activeLang) {
   document.querySelectorAll('a[data-lang]').forEach((link) => {
      const language = link.getAttribute('data-lang');
      if (language === activeLang) {
         link.classList.add('active');
      } else {
         link.classList.remove('active');
      }
   });
}

document.addEventListener('DOMContentLoaded', () => {
   const defaultLanguage = 'en';
   loadTranslations(defaultLanguage);
   updateLanguageLinks(defaultLanguage);
});
