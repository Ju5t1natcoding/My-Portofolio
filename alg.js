document.addEventListener("DOMContentLoaded", async () => {
  /* ---------- Smooth Scroll ---------- */
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

  /* ---------- Translator Logic ---------- */
  const translatableElements = document.querySelectorAll("[data-lang]");
  async function dynamicTranslate(text, targetLang) {
    if (text.trim() === "") return ""; // Nu traducem text gol
    const cacheKey = `translate_${text}_${targetLang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      if (data?.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        if (translated.includes("NO QUERY SPECIFIED")) {
          return text;
        }
        localStorage.setItem(cacheKey, translated);
        return translated;
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
      // Nu traducem elementele care au atributul data-no-translate
      if (el.hasAttribute("data-no-translate")) continue;
      const originalText = el.dataset.original || el.innerText;
      el.dataset.original = originalText;
      el.innerText = (lang === "en") ? originalText : await dynamicTranslate(originalText, lang);
    }
  }
  const savedLang = localStorage.getItem("language") || "en";
  document.getElementById("lang").value = savedLang;
  await changeLanguage();
  document.getElementById("lang").addEventListener("change", changeLanguage);

  /* ---------- Code Samples ---------- */
  const codeSamples = {
    "Merge Sort": {
      cpp: `void sort(vector<int> &a, int l, int r) { 
    static auto intercl = [](vector<int> &a, int l, int mid, int r) { 
        vector<int> v(r - l + 1);
        int i = l, k = 0, j = mid + 1;
        while (i <= mid && j <= r) { 
            if (a[i] <= a[j]) { v[k++] = a[i++]; } 
            else { v[k++] = a[j++]; }
        }
        while (i <= mid) { v[k++] = a[i++]; }
        while (j <= r) { v[k++] = a[j++]; }
        for (int i = 0; i < r - l + 1; ++i) { a[l + i] = v[i]; }
    };
    if (l < r) { 
        int mid = l + (r - l) / 2;
        sort(a, l, mid);
        sort(a, mid + 1, r);
        intercl(a, l, mid, r);
    }
}`,
      cs: `using System;
using System.Collections.Generic;
public class SortingAlgorithms {
    public static void MergeSort(List<int> a, int l, int r) {
        if (l < r) {
            int mid = l + (r - l) / 2;
            MergeSort(a, l, mid);
            MergeSort(a, mid + 1, r);
            Merge(a, l, mid, r);
        }
    }
    private static void Merge(List<int> a, int l, int mid, int r) {
        List<int> v = new List<int>(r - l + 1);
        int i = l, j = mid + 1;
        while (i <= mid && j <= r) {
            if (a[i] <= a[j]) { v.Add(a[i]); i++; }
            else { v.Add(a[j]); j++; }
        }
        while (i <= mid) { v.Add(a[i]); i++; }
        while (j <= r) { v.Add(a[j]); j++; }
        for (int k = 0; k < v.Count; k++) { a[l + k] = v[k]; }
    }
}`,
      js: `function mergeSort(a, l, r) {
  if (l < r) {
    const mid = Math.floor((l + r) / 2);
    mergeSort(a, l, mid);
    mergeSort(a, mid + 1, r);
    merge(a, l, mid, r);
  }
}
function merge(a, l, mid, r) {
  let v = [];
  let i = l, j = mid + 1;
  while (i <= mid && j <= r) {
    if (a[i] <= a[j]) { v.push(a[i++]); }
    else { v.push(a[j++]); }
  }
  while (i <= mid) { v.push(a[i++]); }
  while (j <= r) { v.push(a[j++]); }
  for (let k = 0; k < v.length; k++) { a[l + k] = v[k]; }
}`
    },
    "Quick Sort": {
      cpp: `void quickS(int l, int r) { 
    int pos; 
    static auto posi = [](int l, int r, int &pos) { 
        int val = a[l], i, j; 
        i = l, j = r;
        while (i < j) {
            while (a[i] <= val && i < r) { ++i; }
            while (a[j] > val && j > l) { --j; }
            if (i < j) { 
                if (a[i] != a[j]) {
                    a[i] = a[i] ^ a[j];
                    a[j] = a[i] ^ a[j];
                    a[i] = a[i] ^ a[j];
                }
            }
        }
        pos = j;
        if (a[l] != a[j]) {
            a[l] = a[l] ^ a[j];
            a[j] = a[l] ^ a[j];
            a[l] = a[l] ^ a[j];
        }
    };
    if (l + 1 == r) {
        if (a[l] > a[r]) {
            a[l] = a[l] ^ a[r];
            a[r] = a[l] ^ a[r];
            a[l] = a[l] ^ a[r];
        }
    } else if (l < r) {
        posi(l, r, pos);
        quickS(l, pos - 1);
        quickS(pos + 1, r);
    }
}`,
      cs: `using System;
using System.Collections.Generic;
public class QuickSortAlgorithm {
    public static void QuickSort(List<int> a, int l, int r) {
        if (l < r) {
            if (l + 1 == r) {
                if (a[l] > a[r]) { Swap(a, l, r); }
            } else {
                int pos = Partition(a, l, r);
                QuickSort(a, l, pos - 1);
                QuickSort(a, pos + 1, r);
            }
        }
    }
    private static int Partition(List<int> a, int l, int r) {
        int val = a[l];
        int i = l, j = r;
        while (i < j) {
            while (i < r && a[i] <= val) { i++; }
            while (j > l && a[j] > val) { j--; }
            if (i < j) { Swap(a, i, j); }
        }
        Swap(a, l, j);
        return j;
    }
    private static void Swap(List<int> a, int i, int j) {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}`,
      js: `async function quickSortAnimation(a, l, r, token) {
  if (l < r) {
    if (l + 1 === r) {
      if (a[l] > a[r]) { await swapAnimation(a, l, r, token); }
    } else {
      let pos = await partitionAnimation(a, l, r, token);
      await quickSortAnimation(a, l, pos - 1, token);
      await quickSortAnimation(a, pos + 1, r, token);
    }
  }
}
async function partitionAnimation(a, l, r, token) {
  const pivot = a[l];
  let i = l, j = r;
  while (i < j) {
    while (i < r && a[i] <= pivot) { i++; }
    while (j > l && a[j] > pivot) { j--; }
    if (i < j) { await swapAnimation(a, i, j, token); }
  }
  await swapAnimation(a, l, j, token);
  return j;
}
async function swapAnimation(a, i, j, token) {
  if (token !== getCurrentToken()) return;
  const temp = a[i];
  a[i] = a[j];
  a[j] = temp;
  updateBarPositions(a);
  await sleep(200);
}`
    }
    // Coduri pentru BFS/DFS pot fi adăugate similar
  };

  /* ---------- Code Viewer Logic ---------- */
  const codeDisplay = document.getElementById("code-display").querySelector("code");
  const codeLangBtns = document.querySelectorAll(".code-lang-btn");
  let currentAlgorithm = "";
  let currentCodeLang = "cpp"; // limbaj implicit
  function updateCodeDisplay() {
    if (currentAlgorithm && codeSamples[currentAlgorithm]) {
      codeDisplay.textContent = codeSamples[currentAlgorithm][currentCodeLang] || "// Code not available";
    }
  }
  codeLangBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentCodeLang = btn.getAttribute("data-lang-key");
      updateCodeDisplay();
    });
  });

  /* ---------- Utility: Delay ---------- */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ---------- Simulation Cancellation ---------- */
  let simulationToken = 0;
  function cancelCurrentSimulation() {
    simulationToken++;
  }
  function getCurrentToken() {
    return simulationToken;
  }

  /* ---------- Loading Screen ---------- */
  async function showLoadingScreen() {
    visualizationArea.innerHTML = "";
    const loadingContainer = document.createElement("div");
    loadingContainer.style.position = "absolute";
    loadingContainer.style.top = "50%";
    loadingContainer.style.left = "50%";
    loadingContainer.style.transform = "translate(-50%, -50%)";
    loadingContainer.style.width = "80%";
    loadingContainer.style.height = "20px";
    loadingContainer.style.border = "1px solid #28b348";
    loadingContainer.style.borderRadius = "10px";
    const loadingBar = document.createElement("div");
    loadingBar.style.height = "100%";
    loadingBar.style.width = "0%";
    loadingBar.style.background = "#28b348";
    loadingBar.style.borderRadius = "10px";
    loadingContainer.appendChild(loadingBar);
    visualizationArea.appendChild(loadingContainer);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      loadingBar.style.width = progress + "%";
      if (progress >= 100) {
        clearInterval(interval);
        // Nu ștergem încă totul; lăsăm loading bar-ul până când următoarea simulare desenează barele
      }
    }, 80);
    await sleep(1000);
  }

  /* ---------- Visualization Area Setup ---------- */
  const visualizationArea = document.getElementById("visualization-area");
  let barElements = []; // stochează elementele barelor

  // Desenează vectorul ca bare centrate
  function drawBars(array, container) {
    container.innerHTML = "";
    barElements = [];
    const containerWidth = container.clientWidth - 40; // padding
    const barWidth = Math.floor(containerWidth / array.length);
    const totalBarsWidth = barWidth * array.length;
    const offset = (containerWidth - totalBarsWidth) / 2;
    array.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.position = "absolute";
      bar.style.bottom = "0";
      bar.style.width = (barWidth - 2) + "px";
      bar.style.height = value + "px";
      bar.style.left = (offset + index * barWidth) + "px";
      bar.style.transition = "left 0.2s ease, height 0.2s ease";
      container.appendChild(bar);
      barElements.push(bar);
    });
  }

  // Actualizează pozițiile barelor
  function updateBarPositions(array) {
    const containerWidth = visualizationArea.clientWidth - 40;
    const barWidth = Math.floor(containerWidth / array.length);
    const totalBarsWidth = barWidth * array.length;
    const offset = (containerWidth - totalBarsWidth) / 2;
    barElements.forEach((bar, index) => {
      bar.style.left = (offset + index * barWidth) + "px";
      bar.style.height = array[index] + "px";
    });
  }

  async function animateSwap(bar1, bar2, duration = 300) {
    return new Promise(resolve => {
        // Obținem pozițiile inițiale pe axa X
        const rect1 = bar1.getBoundingClientRect();
        const rect2 = bar2.getBoundingClientRect();

        const offset = rect2.left - rect1.left;

        // Aplicăm transformările invers pentru a menține poziția vizuală
        bar1.style.transition = `transform ${duration}ms ease`;
        bar2.style.transition = `transform ${duration}ms ease`;

        bar1.style.transform = `translateX(${offset}px)`;
        bar2.style.transform = `translateX(${-offset}px)`;

        // Așteptăm animația
        setTimeout(() => {
            // Resetăm transformările
            bar1.style.transition = '';
            bar2.style.transition = '';
            bar1.style.transform = '';
            bar2.style.transform = '';

            // Schimbăm pozițiile în DOM (dacă sunt într-un container cu display: flex sau absolute)
            const parent = bar1.parentNode;
            const next = bar2.nextSibling === bar1 ? bar2 : bar2.nextSibling;
            parent.insertBefore(bar2, bar1);
            parent.insertBefore(bar1, next);

            resolve();
        }, duration);
    });
  }

  /* ---------- Merge Sort Simulation ---------- */
  async function simulateMergeSort() {
    cancelCurrentSimulation();
    await sleep(10);
    const token = getCurrentToken();
    let resultDiv = document.getElementById("simulation-result");
    resultDiv.innerHTML = "";
    await showLoadingScreen();
    let array = Array.from({ length: 50 }, () => Math.floor(Math.random() * 290) + 10);
    drawBars(array, visualizationArea);
    await sleep(500);
    await mergeSort(array, 0, array.length - 1, token);
    if (token === getCurrentToken()) {
      let phrase = ": simulation completed.";
      const lang = document.getElementById("lang").value;
      const translatedPhrase = (lang === "en")
        ? phrase
        : await dynamicTranslate(phrase, lang);
      resultDiv.dataset.original = translatedPhrase;
      // Combina numele algoritmului cu textul tradus (numele nu se traduce)
      resultDiv.textContent = "Merge Sort " + translatedPhrase;
    }
  }

  async function mergeSort(array, l, r, token) {
    if (token !== getCurrentToken()) return;
    if (l < r) {
      const mid = Math.floor((l + r) / 2);
      await mergeSort(array, l, mid, token);
      await mergeSort(array, mid + 1, r, token);
      await merge(array, l, mid, r, token);
    }
  }

  async function merge(array, l, mid, r, token) {
    let left = array.slice(l, mid + 1);
    let right = array.slice(mid + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      if (token !== getCurrentToken()) return;
      if (left[i] <= right[j]) { array[k++] = left[i++]; }
      else { array[k++] = right[j++]; }
      updateBarPositions(array);
      await sleep(100);
    }
    while (i < left.length) { array[k++] = left[i++]; updateBarPositions(array); await sleep(100); }
    while (j < right.length) { array[k++] = right[j++]; updateBarPositions(array); await sleep(100); }
  }

  /* ---------- Quick Sort Simulation ---------- */
  async function simulateQuickSort() {
    cancelCurrentSimulation();
    await sleep(10);
    const token = getCurrentToken();
    let resultDiv = document.getElementById("simulation-result");
    resultDiv.innerHTML = "";
    await showLoadingScreen();
    let array = Array.from({ length: 50 }, () => Math.floor(Math.random() * 290) + 10);
    drawBars(array, visualizationArea);
    await sleep(500);
    await quickSortAnimation(array, 0, array.length - 1, token);
    updateBarPositions(array);
    if (token === getCurrentToken()) {
      let phrase = ": simulation completed.";
      const lang = document.getElementById("lang").value;
      const translatedPhrase = (lang === "en")
        ? phrase
        : await dynamicTranslate(phrase, lang);
      resultDiv.dataset.original = translatedPhrase;
      resultDiv.textContent = "Quick Sort " + translatedPhrase;
    }
  }

  async function quickSortAnimation(a, l, r, token) {
    if (token !== getCurrentToken()) return;
    if (l < r) {
      if (l + 1 === r) {
        if (a[l] > a[r]) { await swapAnimation(a, l, r, token); }
      } else {
        let pos = await partitionAnimation(a, l, r, token);
        await quickSortAnimation(a, l, pos - 1, token);
        await quickSortAnimation(a, pos + 1, r, token);
      }
    }
  }

  async function partitionAnimation(a, l, r, token) {
    const pivot = a[l];
    let i = l, j = r;
    while (i < j) {
      if (token !== getCurrentToken()) return;
      while (i < r && a[i] <= pivot) { i++; }
      while (j > l && a[j] > pivot) { j--; }
      if (i < j) { await swapAnimation(a, i, j, token); }
    }
    await swapAnimation(a, l, j, token);
    return j;
  }

  async function swapAnimation(a, i, j, token) {
    if (token !== getCurrentToken()) return;
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
    updateBarPositions(a);
    await sleep(200);
  }

  /* ---------- Simulation Trigger ---------- */
  const btns = document.querySelectorAll('.btn-run');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      cancelCurrentSimulation();
      visualizationArea.innerHTML = "";
      document.getElementById("simulation-result").innerHTML = "";
      currentAlgorithm = btn.parentElement.getAttribute('data-algorithm');
      updateCodeDisplay();
      if (currentAlgorithm === "Merge Sort") {
        simulateMergeSort();
      } else if (currentAlgorithm === "Quick Sort") {
        simulateQuickSort();
      } else {
        visualizationArea.innerHTML = `<p style="color:#28b348;">${currentAlgorithm} simulation is not implemented yet.</p>`;
      }
    });
  });
});
