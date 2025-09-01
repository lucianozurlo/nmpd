/* Detección robusta de iPad (incluye iPadOS que se reporta como "Mac") */
function isIPad() {
  const ua = navigator.userAgent || '';
  const isiPadUA = /\biPad\b/.test(ua);
  const isiPadLike = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return isiPadUA || isiPadLike;
}

function isPhone() {
  const ua = navigator.userAgent || '';
  // Consideramos móviles comunes (sin contar iPad)
  const isMobileUA = /\b(Mobi|Android|iPhone|iPod)\b/i.test(ua);
  return isMobileUA && !isIPad();
}

function currentOrientation() {
  // Fallback sólido por si no existe screen.orientation
  const landscape =
    (screen.orientation && screen.orientation.type.includes('landscape')) || window.innerWidth > window.innerHeight;
  return landscape ? 'landscape' : 'portrait';
}

function applyClasses() {
  const body = document.body;
  body.classList.remove(
    'device-mobile',
    'device-ipad',
    'device-desktop',
    'orientation-landscape',
    'orientation-portrait'
  );

  if (isIPad()) {
    body.classList.add('device-ipad');
  } else if (isPhone()) {
    body.classList.add('device-mobile');
  } else {
    body.classList.add('device-desktop');
  }

  body.classList.add('orientation-' + currentOrientation());
  updateLabel();
}

function updateLabel() {
  const label = document.getElementById('label');
  const vw = document.getElementById('vw');
  const classes = [...document.body.classList].join(' ');
  label.textContent = classes;
  vw.textContent = `Viewport: ${window.innerWidth}×${window.innerHeight}`;
}

// Reaccionar a rotación y resize
window.addEventListener('orientationchange', applyClasses);
window.addEventListener('resize', applyClasses);

document.addEventListener('DOMContentLoaded', applyClasses);
