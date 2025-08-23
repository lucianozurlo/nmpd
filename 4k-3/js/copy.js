document.getElementById('copyButton').addEventListener('click', function () {
   event.preventDefault();

   var textToCopy = document.getElementById('textToCopy').innerText;

   var textarea = document.createElement('textarea');
   textarea.value = textToCopy;
   document.body.appendChild(textarea);

   textarea.select();
   textarea.setSelectionRange(0, 99999);

   document.execCommand('copy');

   document.body.removeChild(textarea);

   document.getElementById('confirmationMessage').style.opacity = '1';

   setTimeout(function () {
      document.getElementById('confirmationMessage').style.opacity = '0';
   }, 2000);
});
