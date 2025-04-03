document.addEventListener("DOMContentLoaded", async function() {
  // Smooth Scroll for all anchor links that start with "#"
  const scrollLinks = document.querySelectorAll("a[href^='#']");
  scrollLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Dynamic Translation Logic with Caching
  const translatableElements = document.querySelectorAll("[data-lang]");
  
  async function dynamicTranslate(text, targetLang) {
    const cacheKey = `translate_${text}_${targetLang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      if (data?.responseData?.translatedText) {
        localStorage.setItem(cacheKey, data.responseData.translatedText);
        return data.responseData.translatedText;
      }
    } catch (e) {
      console.error("Translation error:", e);
    }
    return text;
  }

  async function changeLanguage() {
    const lang = document.getElementById("lang").value;
    localStorage.setItem("language", lang);
    for (let el of translatableElements) {
      const originalText = el.dataset.original || el.innerText;
      el.dataset.original = originalText;
      el.innerText = (lang === "en") ? originalText : await dynamicTranslate(originalText, lang);
    }
  }

  const savedLang = localStorage.getItem("language") || "en";
  document.getElementById("lang").value = savedLang;
  await changeLanguage();
  document.getElementById("lang").addEventListener("change", changeLanguage);

  // 3D Scene Setup using Three.js (simplified)
  function create3DScene() {
    const canvas = document.getElementById("threeD-canvas");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.z = 5;
    
    // Create a rotating cube as a simple 3D element
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x007bff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.005;
      renderer.render(scene, camera);
    }
    animate();

    // Handle resizing
    window.addEventListener("resize", () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  }
  
  create3DScene();
});
