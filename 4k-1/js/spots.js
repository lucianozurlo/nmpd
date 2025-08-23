const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function initializeSpots() {
   const containers = document.querySelectorAll('.spots-container');
   const deviceHasHover = window.matchMedia('(hover: hover)').matches;

   containers.forEach((container) => {
      const spots = container.querySelectorAll('.spot');
      const messageBox = container.querySelector('.message-box-spot');
      const lineElement = container.querySelector('.line-spot');

      let hideTimeout;
      let activeSpot = null;

      const ensureMeasurable = () => {
         const prevDisplay = messageBox.style.display;
         const prevVisibility = messageBox.style.visibility;
         messageBox.style.display = 'block';
         messageBox.style.visibility = 'hidden';
         void messageBox.offsetWidth;
         return () => {
            messageBox.style.visibility = prevVisibility || '';
            messageBox.style.display = prevDisplay || 'block';
         };
      };

      const setLineBetween = (x1, y1, x2, y2, rect) => {
         if (y1 === y2) {
            const leftPx = Math.min(x1, x2);
            const widthPx = Math.abs(x2 - x1);
            lineElement.style.left = `${(leftPx / rect.width) * 100}%`;
            lineElement.style.top = `${(y1 / rect.height) * 100}%`;
            lineElement.style.width = `${widthPx}px`;
            lineElement.style.height = `1px`;
         } else {
            const topPx = Math.min(y1, y2);
            const heightPx = Math.abs(y2 - y1);
            lineElement.style.left = `${(x1 / rect.width) * 100}%`;
            lineElement.style.top = `${(topPx / rect.height) * 100}%`;
            lineElement.style.width = `1px`;
            lineElement.style.height = `${heightPx}px`;
         }
      };

      const adjustEndpointForTooltip = (
         position,
         startX,
         startY,
         endX,
         endY,
         tipW,
         tipH,
         rect,
         margin
      ) => {
         let transform = '';

         if (position === 'right') {
            transform = 'translate(0, -50%)';
            const maxEndX = rect.width - margin - tipW;
            endX = clamp(endX, margin, maxEndX);
         } else if (position === 'left') {
            transform = 'translate(-100%, -50%)';
            const minEndX = margin + tipW;
            endX = clamp(endX, minEndX, rect.width - margin);
         } else if (position === 'bottom') {
            transform = 'translate(-50%, 0)';
            const maxEndY = rect.height - margin - tipH;
            endY = clamp(endY, margin, maxEndY);
         } else {
            transform = 'translate(-50%, -100%)';
            const minEndY = margin + tipH;
            endY = clamp(endY, minEndY, rect.height - margin);
         }

         if (position === 'right' && endX < startX) endX = startX;
         if (position === 'left' && endX > startX) endX = startX;
         if (position === 'bottom' && endY < startY) endY = startY;
         if (position === 'top' && endY > startY) endY = startY;

         return { endX, endY, transform };
      };

      const showMessage = (spot) => {
         clearTimeout(hideTimeout);

         const message = spot.getAttribute('data-hover');
         const position = spot.getAttribute('data-position') || 'bottom';
         const linePercent = parseFloat(spot.getAttribute('data-line-length')) || 5;

         messageBox.textContent = message;

         const spotRect = spot.getBoundingClientRect();
         const rect = container.getBoundingClientRect();

         const lineLength = (linePercent / 100) * rect.width;
         const lineOffset = 22;

         let lineStartX, lineStartY, lineEndX, lineEndY;

         switch (position) {
            case 'top':
               lineStartX = spotRect.left - rect.left + spotRect.width / 2;
               lineStartY = spotRect.top - rect.top - lineOffset;
               lineEndX = lineStartX;
               lineEndY = lineStartY - lineLength;
               break;

            case 'bottom':
               lineStartX = spotRect.left - rect.left + spotRect.width / 2;
               lineStartY = spotRect.bottom - rect.top + lineOffset;
               lineEndX = lineStartX;
               lineEndY = lineStartY + lineLength;
               break;

            case 'left':
               lineStartX = spotRect.left - rect.left - lineOffset;
               lineStartY = spotRect.top - rect.top + spotRect.height / 2;
               lineEndX = lineStartX - lineLength;
               lineEndY = lineStartY;
               break;

            case 'right':
            default:
               lineStartX = spotRect.right - rect.left + lineOffset;
               lineStartY = spotRect.top - rect.top + spotRect.height / 2;
               lineEndX = lineStartX + lineLength;
               lineEndY = lineStartY;
               break;
         }

         const restore = ensureMeasurable();
         const tipW = messageBox.offsetWidth;
         const tipH = messageBox.offsetHeight;
         const margin = 8;

         const adjusted = adjustEndpointForTooltip(
            position,
            lineStartX,
            lineStartY,
            lineEndX,
            lineEndY,
            tipW,
            tipH,
            rect,
            margin
         );
         lineEndX = adjusted.endX;
         lineEndY = adjusted.endY;

         setLineBetween(lineStartX, lineStartY, lineEndX, lineEndY, rect);

         messageBox.style.left = `${(lineEndX / rect.width) * 100}%`;
         messageBox.style.top = `${(lineEndY / rect.height) * 100}%`;
         messageBox.style.transform = adjusted.transform;

         restore();
         messageBox.setAttribute('aria-hidden', 'false');
         messageBox.style.opacity = '1';
         lineElement.style.opacity = '1';
      };

      const hideMessage = (immediate = false) => {
         const doHide = () => {
            messageBox.style.opacity = '0';
            lineElement.style.opacity = '0';
            messageBox.setAttribute('aria-hidden', 'true');
            activeSpot = null;
         };
         if (immediate) {
            clearTimeout(hideTimeout);
            doHide();
         } else {
            hideTimeout = setTimeout(doHide, 150);
         }
      };

      if (deviceHasHover) {
         spots.forEach((spot) => {
            spot.addEventListener('pointerenter', () => showMessage(spot));
            spot.addEventListener('pointerleave', () => hideMessage());
            spot.addEventListener('focus', () => showMessage(spot));
            spot.addEventListener('blur', () => hideMessage());
         });
      } else {
         spots.forEach((spot) => {
            spot.addEventListener(
               'click',
               (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (activeSpot === spot) {
                     hideMessage(true);
                  } else {
                     activeSpot = spot;
                     showMessage(spot);
                  }
               },
               { passive: false }
            );

            spot.addEventListener('keydown', (e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (activeSpot === spot) hideMessage(true);
                  else {
                     activeSpot = spot;
                     showMessage(spot);
                  }
               }
            });
         });

         document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) hideMessage(true);
         });

         let lastScrollY = window.scrollY;
         window.addEventListener(
            'scroll',
            () => {
               if (Math.abs(window.scrollY - lastScrollY) > 2) {
                  hideMessage(true);
                  lastScrollY = window.scrollY;
               }
            },
            { passive: true }
         );
      }
   });
}

document.addEventListener('DOMContentLoaded', initializeSpots);
