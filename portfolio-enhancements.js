(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Scroll progress indicator.
  const progressBar = $('#scroll-progress-bar');

  const updateProgress = () => {
    if (!progressBar) return;

    const max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      max > 0
        ? (window.scrollY / max) * 100
        : 0;

    progressBar.style.width =
      `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener(
    'scroll',
    updateProgress,
    { passive: true }
  );

  updateProgress();


  // Pointer-following ambient light.
  const spotlight = $('.cursor-spotlight');

  if (
    spotlight &&
    window.matchMedia('(pointer:fine)').matches
  ) {
    window.addEventListener(
      'pointermove',
      (event) => {
        spotlight.style.setProperty(
          '--pointer-x',
          `${event.clientX}px`
        );

        spotlight.style.setProperty(
          '--pointer-y',
          `${event.clientY}px`
        );
      },
      { passive: true }
    );
  }


  // Subtle reveal-on-scroll animation.
  const revealItems =
    $$('.reveal-on-scroll');

  if (
    'IntersectionObserver' in window &&
    revealItems.length
  ) {
    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              'is-visible'
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            '0px 0px -40px 0px'
        }
      );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });

  } else {
    revealItems.forEach((item) => {
      item.classList.add(
        'is-visible'
      );
    });
  }


  // Lightweight 3D tilt for highlighted cards.
  // Disabled for reduced-motion users.
  const reduceMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  if (
    !reduceMotion &&
    window.matchMedia(
      '(pointer:fine)'
    ).matches
  ) {
    $$('[data-tilt-soft]')
      .forEach((card) => {

        const strength =
          card.classList.contains(
            'flagship-project'
          )
            ? 3
            : 4;

        card.addEventListener(
          'pointermove',
          (event) => {

            const rect =
              card.getBoundingClientRect();

            const x =
              (event.clientX -
                rect.left) /
                rect.width -
              0.5;

            const y =
              (event.clientY -
                rect.top) /
                rect.height -
              0.5;

            card.style.setProperty(
              '--tilt-x',
              `${(-y * strength).toFixed(2)}deg`
            );

            card.style.setProperty(
              '--tilt-y',
              `${(x * strength).toFixed(2)}deg`
            );
          }
        );

        card.addEventListener(
          'pointerleave',
          () => {
            card.style.setProperty(
              '--tilt-x',
              '0deg'
            );

            card.style.setProperty(
              '--tilt-y',
              '0deg'
            );
          }
        );
      });
  }


  // Image lightbox with keyboard navigation
  // for every achievement gallery.
  const lightbox =
    $('#lightbox');

  const lightboxImage =
    $('#lightbox-image');

  const lightboxCaption =
    $('#lightbox-caption');

  const closeButton =
    $('#lightbox-close');

  const prevButton =
    $('#lightbox-prev');

  const nextButton =
    $('#lightbox-next');


  if (
    !lightbox ||
    !lightboxImage ||
    !lightboxCaption
  ) {
    return;
  }


  let currentGallery = [];
  let currentIndex = 0;


  const renderLightbox = () => {

    const item =
      currentGallery[
        currentIndex
      ];

    if (!item) {
      return;
    }

    const img =
      $('img', item);

    lightboxImage.src =
      img.currentSrc ||
      img.src;

    lightboxImage.alt =
      img.alt || '';

    lightboxCaption.textContent =
      item.dataset.caption ||
      img.alt ||
      '';

    const multiple =
      currentGallery.length > 1;

    prevButton.hidden =
      !multiple;

    nextButton.hidden =
      !multiple;
  };


  const openLightbox = (
    gallery,
    index
  ) => {

    currentGallery =
      gallery;

    currentIndex =
      index;

    renderLightbox();

    lightbox.hidden =
      false;

    lightbox.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'lightbox-open'
    );

    closeButton.focus();
  };


  const closeLightbox = () => {

    lightbox.hidden =
      true;

    lightbox.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'lightbox-open'
    );

    lightboxImage.src =
      '';
  };


  // Attach lightbox behaviour
  // to each achievement gallery.
  $$('.proof-gallery')
    .forEach((gallery) => {

      const buttons =
        $$('.proof-thumb', gallery);

      buttons.forEach(
        (button, index) => {

          button.addEventListener(
            'click',
            () => {
              openLightbox(
                buttons,
                index
              );
            }
          );
        }
      );
    });


  // Keep every proof toggle label
  // in sync with the open/closed state.
  //
  // Example:
  //
  // "View team project"
  //       ↓
  // "Hide team project"
  //
  // Works automatically for
  // every .proof-details element.
  $$('.proof-details')
    .forEach((details) => {

      const summary =
        $('summary', details);

      if (!summary) {
        return;
      }


      const closedLabel =
        (
          summary.textContent || ''
        )
          .trim()
          .replace(
            /^Hide\b/i,
            'View'
          );


      const openLabel =
        closedLabel.replace(
          /^View\b/i,
          'Hide'
        );


      summary.dataset.closedLabel =
        closedLabel;

      summary.dataset.openLabel =
        openLabel;


      const syncLabel = () => {

        summary.textContent =
          details.open
            ? summary.dataset.openLabel
            : summary.dataset.closedLabel;
      };


      details.addEventListener(
        'toggle',
        syncLabel
      );


      syncLabel();
    });


  const moveLightbox =
    (direction) => {

      if (
        currentGallery.length <
        2
      ) {
        return;
      }

      currentIndex =
        (
          currentIndex +
          direction +
          currentGallery.length
        ) %
        currentGallery.length;

      renderLightbox();
    };


  closeButton.addEventListener(
    'click',
    closeLightbox
  );


  prevButton.addEventListener(
    'click',
    () =>
      moveLightbox(-1)
  );


  nextButton.addEventListener(
    'click',
    () =>
      moveLightbox(1)
  );


  // Close when clicking
  // the lightbox backdrop.
  lightbox.addEventListener(
    'click',
    (event) => {

      if (
        event.target ===
        lightbox
      ) {
        closeLightbox();
      }
    }
  );


  // Keyboard navigation.
  document.addEventListener(
    'keydown',
    (event) => {

      if (lightbox.hidden) {
        return;
      }

      if (
        event.key ===
        'Escape'
      ) {
        closeLightbox();
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        moveLightbox(-1);
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        moveLightbox(1);
      }
    }
  );

})();