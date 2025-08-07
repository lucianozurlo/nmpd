document.getElementById ('copyButton').addEventListener ('click', function () {
  event.preventDefault (); // Evita el comportamiento por defecto del botón

  // Selecciona el div o texto a copiar
  var textToCopy = document.getElementById ('textToCopy').innerText;

  // Crea un textarea temporal para copiar el texto
  var textarea = document.createElement ('textarea');
  textarea.value = textToCopy;
  document.body.appendChild (textarea);

  // Selecciona el contenido del textarea
  textarea.select ();
  textarea.setSelectionRange (0, 99999); // Para móviles

  // Copia el contenido seleccionado al portapapeles
  document.execCommand ('copy');

  // Remueve el textarea temporal
  document.body.removeChild (textarea);

  // Mostrar mensaje de confirmación
  document.getElementById ('confirmationMessage').style.opacity = '1';

  setTimeout (function () {
    document.getElementById ('confirmationMessage').style.opacity = '0';
  }, 2000); // Ocultar el mensaje después de 2 segundos
});
