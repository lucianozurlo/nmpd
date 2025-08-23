document.addEventListener('DOMContentLoaded', () => {
   document.querySelectorAll('.splide').forEach((sliderEl) => {
      const startIndex = Number(sliderEl.dataset.start) || 0;

      const splide = new Splide(sliderEl, {
         type: 'loop',
         perPage: 5,
         perMove: 1,
         focus: 'center',
         drag: true,
         snap: true,
         arrows: true,
         pagination: false,
         updateOnMove: true,
         speed: 600,
         start: startIndex,

         breakpoints: {
            1279: {
               perPage: 3,
               perMove: 1,
               focus: 'center',
               speed: 500,
               flickMaxPages: 1,
               flickPower: 450,
            },
            767: {
               perPage: 1,
               perMove: 1,
               focus: 'center',
               speed: 400,
               flickMaxPages: 1,
               flickPower: 350,
            },
         },
      });

      splide.on('click', (slide) => splide.go(slide.index));

      splide.mount();
   });
});
