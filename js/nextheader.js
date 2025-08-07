(function () {
  // Función para monitorear cambios en una .next-project-wrap específica
  function monitorBgNoNext ($element) {
    if ($element.length === 0) return;

    let previouslyHadClass = $element.hasClass ('bg-no-next');

    const observer = new MutationObserver (mutationsList => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const currentlyHasClass = $element.hasClass ('bg-no-next');

          if (previouslyHadClass && !currentlyHasClass) {
            console.log ('CHAU bg-no-next');

            if (
              $ ('#page-content').hasClass ('dark-content') &&
              $ ('.next-project-image-wrapper').hasClass ('next-black')
            ) {
              // Cambiamos de dark a light
              $ ('#page-content')
                .addClass ('light-content')
                .addClass ('noblur-light')
                .removeClass ('dark-content')
                .removeClass ('noblur-dark');

              console.log ('Cambio a LIGHT');
            } else if (
              $ ('#page-content').hasClass ('light-content') &&
              $ ('.next-project-image-wrapper').hasClass ('next-white')
            ) {
              // Cambiamos de light a dark
              $ ('#page-content')
                .addClass ('dark-content')
                .addClass ('noblur-dark')
                .removeClass ('light-content')
                .removeClass ('noblur-light');
              console.log ('estaba light ahora dark');
            }
          } else if (!previouslyHadClass && currentlyHasClass) {
            // Si antes no la tenía y ahora sí, se agregó la clase
            console.log ('HOLA bg-no-next');

            if ($ ('#page-content').hasClass ('black')) {
              // Cambiamos de dark a light
              $ ('#page-content')
                .addClass ('light-content')
                .removeClass ('dark-content');
              console.log ('Cambio a DARK');
            } else if ($ ('#page-content').hasClass ('white')) {
              // Cambiamos de light a dark
              $ ('#page-content')
                .addClass ('dark-content')
                .removeClass ('light-content');
              console.log ('Cambio a LIGHT');
            }
          }

          // Actualizamos el estado previo
          previouslyHadClass = currentlyHasClass;
        }
      }
    });

    observer.observe ($element[0], {
      attributes: true, // Observamos cambios en atributos
      attributeFilter: ['class'], // Nos enfocamos únicamente en el atributo 'class'
    });
  }

  // Monitorear la carga inicial de .next-project-wrap
  $ (document).ready (function () {
    $ ('.next-project-wrap').each (function () {
      monitorBgNoNext ($ (this));
    });
  });

  // Observador global para detectar la adición de nuevos .next-project-wrap
  const globalObserver = new MutationObserver (mutationsList => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach (node => {
          const $node = $ (node);
          if ($node.hasClass ('next-project-wrap')) {
            monitorBgNoNext ($node);
          } else {
            // Si el nodo agregado contiene elementos .next-project-wrap
            $node.find ('.next-project-wrap').each (function () {
              monitorBgNoNext ($ (this));
            });
          }
        });
      }
    }
  });

  // Iniciar el observador global
  globalObserver.observe (document.body, {
    childList: true, // Observa la adición o eliminación de nodos hijos
    subtree: true, // Observa todos los niveles de descendencia
  });
}) ();
