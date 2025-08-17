(function () {
   function monitorBgNoNext($element) {
      if ($element.length === 0) return;

      let previouslyHadClass = $element.hasClass('bg-no-next');

      const observer = new MutationObserver((mutationsList) => {
         for (let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
               const currentlyHasClass = $element.hasClass('bg-no-next');

               if (previouslyHadClass && !currentlyHasClass) {
                  console.log('CHAU bg-no-next');

                  if (
                     $('#page-content').hasClass('dark-content') &&
                     $('.next-project-image-wrapper').hasClass('next-black')
                  ) {
                     $('#page-content')
                        .addClass('light-content')
                        .addClass('noblur-light')
                        .removeClass('dark-content')
                        .removeClass('noblur-dark');

                     console.log('Cambio a LIGHT');
                  } else if (
                     $('#page-content').hasClass('light-content') &&
                     $('.next-project-image-wrapper').hasClass('next-white')
                  ) {
                     $('#page-content')
                        .addClass('dark-content')
                        .addClass('noblur-dark')
                        .removeClass('light-content')
                        .removeClass('noblur-light');
                     console.log('estaba light ahora dark');
                  }
               } else if (!previouslyHadClass && currentlyHasClass) {
                  console.log('HOLA bg-no-next');

                  if ($('#page-content').hasClass('black')) {
                     $('#page-content').addClass('light-content').removeClass('dark-content');
                     console.log('Cambio a DARK');
                  } else if ($('#page-content').hasClass('white')) {
                     $('#page-content').addClass('dark-content').removeClass('light-content');
                     console.log('Cambio a LIGHT');
                  }
               }

               previouslyHadClass = currentlyHasClass;
            }
         }
      });

      observer.observe($element[0], {
         attributes: true,
         attributeFilter: ['class'],
      });
   }

   $(document).ready(function () {
      $('.next-project-wrap').each(function () {
         monitorBgNoNext($(this));
      });
   });

   const globalObserver = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
         if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
               const $node = $(node);
               if ($node.hasClass('next-project-wrap')) {
                  monitorBgNoNext($node);
               } else {
                  $node.find('.next-project-wrap').each(function () {
                     monitorBgNoNext($(this));
                  });
               }
            });
         }
      }
   });

   globalObserver.observe(document.body, {
      childList: true,
      subtree: true,
   });
})();
