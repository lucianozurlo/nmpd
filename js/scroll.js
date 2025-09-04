// NO SCROLL //
function lockBodyScroll() {
   if ($('body').hasClass('no-scroll')) return;

   const scrollY = window.scrollY || window.pageYOffset;
   $('body')
      .attr('data-scroll-lock', scrollY)
      .css({
         position: 'fixed',
         top: -scrollY + 'px',
         left: 0,
         right: 0,
         width: '100%',
         overflow: 'hidden',
      })
      .addClass('no-scroll');

   $(window).on('touchmove.noscroll', (e) => e.preventDefault());
   $(window).on('wheel.noscroll', (e) => e.preventDefault());
}

function unlockBodyScroll() {
   if (!$('body').hasClass('no-scroll')) return;

   const scrollY = parseInt($('body').attr('data-scroll-lock') || '0', 10);
   $('body')
      .removeClass('no-scroll')
      .removeAttr('data-scroll-lock')
      .css({ position: '', top: '', left: '', right: '', width: '', overflow: '' });

   $(window).off('.noscroll');

   window.scrollTo(0, scrollY);
}

// SCROLL //
const btn = document.getElementById('scrollBtn');
const btnTop = document.getElementById('scrollTopBtn');

btn.addEventListener('click', (e) => {
   e.preventDefault();
   window.scrollTo({
      top: window.innerHeight,
      left: 0,
      behavior: 'smooth',
   });
});

btnTop.addEventListener('click', (e) => {
   e.preventDefault();
   window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
   });
});
