(() => {
  'use strict';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  /*
   * =========================================================
   * Scroll progress indicator
   * =========================================================
   */

  const progressBar =
    $('#scroll-progress-bar');

  const updateProgress = () => {

    if (!progressBar) {
      return;
    }

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
    {
      passive: true
    }
  );

  updateProgress();


  /*
   * =========================================================
   * Pointer-following ambient light
   * =========================================================
   */

  const spotlight =
    $('.cursor-spotlight');

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
      {
        passive: true
      }
    );

  }


  /*
   * =========================================================
   * Reveal-on-scroll animations
   * =========================================================
   */

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

      revealObserver.observe(
        item
      );

    });

  } else {

    revealItems.forEach((item) => {

      item.classList.add(
        'is-visible'
      );

    });

  }


  /*
   * =========================================================
   * Lightweight 3D tilt for highlighted cards
   * =========================================================
   *
   * Disabled when the user prefers reduced motion.
   */

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
          ) ||
          card.classList.contains(
            'achievement-grand-card'
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


  /*
   * =========================================================
   * Image lightbox
   * =========================================================
   *
   * Supports:
   *
   * 1. Normal galleries:
   *    .proof-gallery
   *
   * 2. Stacked certificate galleries:
   *    .proof-stack
   *
   * Stacked galleries have special behaviour:
   *
   * - only the front image is visible/clickable as the
   *   active document;
   *
   * - keyboard navigation can move through the entire stack;
   *
   * - when the lightbox is closed, the last image viewed
   *   is promoted to the front of the stack;
   *
   * - this state exists only in the current DOM and is
   *   NOT stored in localStorage;
   *
   * - refreshing the page resets the original order.
   * =========================================================
   */


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
    !lightboxCaption ||
    !closeButton ||
    !prevButton ||
    !nextButton
  ) {
    return;
  }


  /*
   * Current lightbox state
   */

  let currentGallery = [];

  let currentGalleryRoot =
    null;

  let currentIndex =
    0;

  let lastTrigger =
    null;


  /*
   * =========================================================
   * Stack synchronization
   * =========================================================
   *
   * In a stacked gallery, the first child is the active
   * front document.
   *
   * We also control tabindex so keyboard users can only
   * focus the currently active document.
   */

  const syncStack =
    (stack) => {

      if (!stack) {
        return;
      }


      const items =
        $$('.proof-thumb', stack);


      items.forEach(
        (item, index) => {

          item.tabIndex =
            index === 0
              ? 0
              : -1;

        }
      );

    };


  /*
   * =========================================================
   * Promote the last viewed item
   * =========================================================
   *
   * This function is only active for .proof-stack.
   *
   * Example:
   *
   * Initial:
   *
   * 2024
   * 2025
   * 2026
   *
   * User opens stack and navigates to 2026.
   *
   * After closing:
   *
   * 2026
   * 2024
   * 2025
   *
   * No persistence is used.
   */

  const promoteCurrentStackItem =
    () => {

      if (
        !currentGalleryRoot ||
        !currentGalleryRoot.classList.contains(
          'proof-stack'
        )
      ) {
        return;
      }


      const activeItem =
        currentGallery[
          currentIndex
        ];


      if (!activeItem) {
        return;
      }


      /*
       * Move the last-viewed image
       * to the very front.
       */

      if (
        currentGalleryRoot.firstElementChild !==
        activeItem
      ) {

        currentGalleryRoot.insertBefore(
          activeItem,
          currentGalleryRoot.firstElementChild
        );

      }


      /*
       * Recalculate keyboard accessibility.
       */

      syncStack(
        currentGalleryRoot
      );

    };


  /*
   * =========================================================
   * Render current image
   * =========================================================
   */

  const renderLightbox =
    () => {

      const item =
        currentGallery[
          currentIndex
        ];


      if (!item) {
        return;
      }


      const img =
        $('img', item);


      if (!img) {
        return;
      }


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


      /*
       * Remember which exact thumbnail/image
       * the user is currently viewing.
       */

      lastTrigger =
        item;

    };


  /*
   * =========================================================
   * Open lightbox
   * =========================================================
   */

  const openLightbox =
    (
      gallery,
      index,
      galleryRoot
    ) => {

      currentGallery =
        gallery;

      currentGalleryRoot =
        galleryRoot;

      currentIndex =
        index;

      lastTrigger =
        gallery[
          index
        ] ||
        null;


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


  /*
   * =========================================================
   * Close lightbox
   * =========================================================
   */

  const closeLightbox =
    () => {

      /*
       * IMPORTANT:
       *
       * Before hiding the lightbox, promote the last
       * viewed item if this is a stacked gallery.
       */

      promoteCurrentStackItem();


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


      /*
       * Restore focus to the image that was last viewed.
       *
       * This is especially useful after promoting it
       * to the front of a certificate stack.
       */

      requestAnimationFrame(
        () => {

          if (lastTrigger) {

            lastTrigger.focus();

          }

        }
      );

    };


  /*
   * =========================================================
   * Attach lightbox behaviour
   * =========================================================
   *
   * .proof-gallery:not(.proof-stack)
   *     Normal gallery
   *
   * .proof-stack
   *     Stacked certificate folder
   *
   * Using :not(.proof-stack) avoids attaching duplicate
   * click handlers if a future element happens to carry
   * both classes.
   */

  $$('.proof-gallery:not(.proof-stack), .proof-stack')
    .forEach((galleryRoot) => {

      const buttons =
        $$('.proof-thumb', galleryRoot);


      if (!buttons.length) {
        return;
      }


      /*
       * Initialize stacked galleries.
       */

      if (
        galleryRoot.classList.contains(
          'proof-stack'
        )
      ) {

        syncStack(
          galleryRoot
        );

      }


      /*
       * Attach click handlers.
       */

      buttons.forEach(
        (button, index) => {

          button.addEventListener(
            'click',
            () => {

              openLightbox(
                buttons,
                index,
                galleryRoot
              );

            }
          );

        }
      );

    });


  /*
   * =========================================================
   * Keep proof toggle labels synchronized
   * =========================================================
   *
   * Example:
   *
   * View certificate
   *        ↓
   * Hide certificate
   *
   * Works with every .proof-details element.
   * =========================================================
   */

  $$('.proof-details')
    .forEach((details) => {

      const summary =
        $('summary', details);


      if (!summary) {
        return;
      }


      const closedLabel =
        (
          summary.textContent ||
          ''
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


      const syncLabel =
        () => {

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


  /*
   * =========================================================
   * Move through images in lightbox
   * =========================================================
   */

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


  /*
   * =========================================================
   * Lightbox buttons
   * =========================================================
   */

  closeButton.addEventListener(
    'click',
    closeLightbox
  );


  prevButton.addEventListener(
    'click',
    () => {

      moveLightbox(
        -1
      );

    }
  );


  nextButton.addEventListener(
    'click',
    () => {

      moveLightbox(
        1
      );

    }
  );


  /*
   * =========================================================
   * Close when clicking lightbox backdrop
   * =========================================================
   */

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


  /*
   * =========================================================
   * Keyboard navigation
   * =========================================================
   *
   * Escape
   *     Close
   *
   * ArrowLeft
   *     Previous image
   *
   * ArrowRight
   *     Next image
   * =========================================================
   */

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

        return;

      }


      if (
        event.key ===
        'ArrowLeft'
      ) {

        moveLightbox(
          -1
        );

        return;

      }


      if (
        event.key ===
        'ArrowRight'
      ) {

        moveLightbox(
          1
        );

      }

    }
  );

})();