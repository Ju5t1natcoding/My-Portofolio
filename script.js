document.addEventListener("DOMContentLoaded", async function() {
  // --- Smooth Scroll for Navigation Links ---
  const links = document.querySelectorAll("nav ul li a");
  links.forEach(link => {
      link.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      target.scrollIntoView({ behavior: "smooth" });
      });
  });

  // --- Dynamic Translation Logic with Caching ---
  const translatableElements = document.querySelectorAll("[data-lang]");
  
  // Verifică dacă textul a fost deja salvat în cache pentru traducere
  async function dynamicTranslate(text, targetLang) {
      const cacheKey = `translate_${text}_${targetLang}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;  // Dacă există în cache, returnează traducerea
      
      try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
          localStorage.setItem(cacheKey, data.responseData.translatedText);  // Salvează traducerea în cache
          return data.responseData.translatedText;
      }
      } catch (e) {
      console.error("Translation error:", e);
      }
      return text;  // Dacă nu se poate traduce, lasă textul original
  }

  async function changeLanguage() {
      const lang = document.getElementById("lang").value;
      localStorage.setItem("language", lang);
      
      // Parcurge toate elementele și traduce textul
      for (let el of translatableElements) {
      const originalText = el.dataset.original || el.innerText;
      el.dataset.original = originalText;  // Salvează textul original dacă nu este deja salvat
      
      if (lang === "en") {
          el.innerText = originalText;
      } else {
          el.innerText = await dynamicTranslate(originalText, lang);
      }
      }
  }

  const savedLang = localStorage.getItem("language") || "en";
  document.getElementById("lang").value = savedLang;
  await changeLanguage();
  
  document.getElementById("lang").addEventListener("change", changeLanguage);
  
  // --- 3D Scene Setup ---
  function create3DScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / (window.innerHeight / 2),
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threeD-canvas") });
    renderer.setSize(window.innerWidth, window.innerHeight / 2);
    
    // Variabile pentru zoom
    const baseCameraZ = 5;
    camera.position.z = baseCameraZ;
    
    // Set up raycaster and mouse vector
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Creează o piramidă hexagonală mov cu bază mai mare (raza 2)
    const geometry = new THREE.CylinderGeometry(0, 2, 2, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0x800080, flatShading: true });
    const pyramid = new THREE.Mesh(geometry, material);
    scene.add(pyramid);
    
    // Grup pentru "crack"-uri
    const cracksGroup = new THREE.Group();
    pyramid.add(cracksGroup);
    
    let pyramidDamageClicks = 0;
    const damageThreshold = 5;
    let exploding = false;
    
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xffffff, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    // Actualizează coordonatele mouse-ului relativ la canvas și procesează evenimentul
    renderer.domElement.addEventListener("pointerdown", function(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(pyramid);
      
      if (intersects.length > 0 && !exploding) {
        // Clic pe piramidă: adaugă crack și crește damage-ul
        pyramidDamageClicks++;
        addCrack();
        if (pyramidDamageClicks >= damageThreshold) {
          exploding = true;
          explodePyramid();
        }
      } else if (intersects.length === 0) {
        createNebulaExplosion(mouse);
      }
    });
    
    // Event listener pentru zoom (wheel)
    renderer.domElement.addEventListener("wheel", function(event) {
      // Inversează direcția pentru zoom: scroll în jos crește distanța, scroll în sus o micșorează
      camera.position.z += event.deltaY * 0.01;
      // Asigură-te că camera nu se apropie prea mult
      camera.position.z = Math.max(2, camera.position.z);
      event.preventDefault();
    });
    
    // Funcție pentru a adăuga un crack pe piramidă
    function addCrack() {
      const crackGeom = new THREE.Geometry();
      const p1 = new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0);
      const p2 = p1.clone().add(new THREE.Vector3((Math.random()-0.5)*0.5, (Math.random()-0.5)*0.5, 0));
      crackGeom.vertices.push(p1, p2);
      const crackMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2, transparent: true, opacity: 1 });
      const crackLine = new THREE.Line(crackGeom, crackMat);
      cracksGroup.add(crackLine);
    }
    
    // Funcție de reset pentru piramidă și crack-uri
    function resetPyramid() {
      pyramidDamageClicks = 0;
      material.opacity = 1;
      material.transparent = false;
      cracksGroup.clear();
      exploding = false;
    }
    
    // Funcție pentru explozia nebuloasă
    function createNebulaExplosion(clickPos) {
      const numParticles = 500;
      const particlesGeom = new THREE.Geometry();
      for (let i = 0; i < numParticles; i++) {
        const particle = new THREE.Vector3(
          clickPos.x * 5 + (Math.random() - 0.5) * 0.5,
          clickPos.y * 5 + (Math.random() - 0.5) * 0.5,
          0
        );
        particlesGeom.vertices.push(particle);
      }
      const particlesMat = new THREE.PointsMaterial({
        size: 0.02,
        color: new THREE.Color().setHSL(Math.random(), 1.0, 0.5),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      });
      const particleSystem = new THREE.Points(particlesGeom, particlesMat);
      scene.add(particleSystem);
      
      const nebulaStart = Date.now();
      function animateNebula() {
        const elapsed = (Date.now() - nebulaStart) / 1000;
        if (elapsed < 3) {
          particlesMat.opacity = 1 - (elapsed / 3);
          requestAnimationFrame(animateNebula);
        } else {
          scene.remove(particleSystem);
        }
      }
      animateNebula();
    }
    
    // Funcție pentru explozia piramidei folosind fețele geometriei pentru chunk-uri
    function explodePyramid() {
      const geom = new THREE.Geometry().fromBufferGeometry(pyramid.geometry);
      geom.mergeVertices();
      const originalPos = pyramid.position.clone();
      const originalRot = pyramid.rotation.clone();
      pyramid.visible = false;
      
      const pieces = [];
      geom.faces.forEach(face => {
        const faceGeom = new THREE.Geometry();
        faceGeom.vertices.push(
          geom.vertices[face.a].clone(),
          geom.vertices[face.b].clone(),
          geom.vertices[face.c].clone()
        );
        faceGeom.faces.push(new THREE.Face3(0, 1, 2));
        faceGeom.computeFaceNormals();
        const mesh = new THREE.Mesh(faceGeom, material.clone());
        mesh.position.copy(originalPos);
        mesh.rotation.copy(originalRot);
        pieces.push(mesh);
        scene.add(mesh);
      });
      
      const explosionStart = Date.now();
      function animateExplosion() {
        const elapsed = (Date.now() - explosionStart) / 1000;
        if (elapsed < 2) {
          pieces.forEach(piece => {
            piece.position.add(new THREE.Vector3(
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            ));
            piece.material.opacity = Math.max(0, 1 - elapsed / 2);
            piece.material.transparent = true;
          });
          requestAnimationFrame(animateExplosion);
        } else {
          pieces.forEach(piece => scene.remove(piece));
          pyramid.position.copy(originalPos);
          pyramid.rotation.copy(originalRot);
          resetPyramid();
          pyramid.visible = true;
        }
      }
      animateExplosion();
    }
    
    function animate() {
      requestAnimationFrame(animate);
      if (pyramid.visible) {
        pyramid.rotation.x += 0.005;
        pyramid.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    }
    animate();
    
    // Resize listener: actualizează renderer și camera
    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight / 2;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  }
  
  create3DScene();
});
