const userAgent = navigator.userAgent || navigator.vendor || window.opera;

const esIOS = /iPhone|iPad|iPod/.test (userAgent);

const esSafari =
  userAgent.includes ('Safari') &&
  !userAgent.includes ('Chrome') &&
  !userAgent.includes ('CriOS') &&
  !userAgent.includes ('FxiOS') &&
  !userAgent.includes ('Edg');

const lightVideos = document.querySelectorAll ('.lightBg');

lightVideos.forEach (div => {
  if (esIOS) {
    div.classList.add ('ios');
  } else if (esSafari) {
    div.classList.add ('safari');
  }
});
