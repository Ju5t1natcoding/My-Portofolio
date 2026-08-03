document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /*
   * =========================================================
   * Footer year
   * =========================================================
   */

  const yearElement =
    document.getElementById("year");

  if (yearElement) {
    yearElement.textContent =
      new Date().getFullYear();
  }


  /*
   * =========================================================
   * Smooth scrolling
   * =========================================================
   */

  const scrollLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );

  scrollLinks.forEach((link) => {
    link.addEventListener(
      "click",
      function (event) {

        const targetId =
          this.getAttribute("href");

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const targetElement =
          document.querySelector(
            targetId
          );

        if (!targetElement) {
          return;
        }

        event.preventDefault();

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    );
  });


  /*
   * =========================================================
   * Three.js Scene
   * =========================================================
   */

  function create3DScene() {

    const canvas =
      document.getElementById(
        "threeD-canvas"
      );

    if (
      !canvas ||
      typeof THREE === "undefined"
    ) {
      return;
    }


    const width =
      canvas.clientWidth || 800;

    const height =
      canvas.clientHeight || 180;


    const scene =
      new THREE.Scene();


    const camera =
      new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      );


    const renderer =
      new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
      });


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );


    renderer.setSize(
      width,
      height,
      false
    );


    camera.position.z = 5;


    /*
     * Rotating cube
     */

    const geometry =
      new THREE.BoxGeometry();


    const material =
      new THREE.MeshStandardMaterial({
        color: 0x63ead6,
        metalness: 0.35,
        roughness: 0.28
      });


    const cube =
      new THREE.Mesh(
        geometry,
        material
      );


    scene.add(cube);


    /*
     * Lighting
     */

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        0.6
      );

    scene.add(
      ambientLight
    );


    const pointLight =
      new THREE.PointLight(
        0xffffff,
        0.9
      );

    pointLight.position.set(
      5,
      5,
      5
    );

    scene.add(
      pointLight
    );


    /*
     * Animation loop
     */

    function animate() {

      requestAnimationFrame(
        animate
      );

      cube.rotation.x +=
        0.005;

      cube.rotation.y +=
        0.007;

      renderer.render(
        scene,
        camera
      );
    }


    animate();


    /*
     * Handle resizing
     */

    function resizeScene() {

      const newWidth =
        canvas.clientWidth ||
        width;

      const newHeight =
        canvas.clientHeight ||
        height;


      renderer.setSize(
        newWidth,
        newHeight,
        false
      );


      camera.aspect =
        newWidth /
        newHeight;


      camera.updateProjectionMatrix();
    }


    window.addEventListener(
      "resize",
      resizeScene
    );


    resizeScene();
  }


  create3DScene();
});