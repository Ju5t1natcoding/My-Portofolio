document.addEventListener("DOMContentLoaded", async function() {
    // --- Dynamic Translation Logic with Caching ---
    const translatableElements = document.querySelectorAll("[data-lang]");

    async function dynamicTranslate(text, targetLang) {
        const cacheKey = `translate_${text}_${targetLang}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
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

});


// Colectează valorile din grilă și returnează un tablou de 81 numere
function getSudokuInput() {
    const board = [];
    for (let i = 0; i < 81; i++) {
      const cell = document.getElementById(`cell-${i}`);
      const value = cell.value.trim();
      board.push(value === "" ? 0 : parseInt(value));
    }
    return board;
  }
  
  // Animează actualizarea celulelor cu soluția
  function animateSolution(solution) {
    solution.forEach((num, i) => {
      setTimeout(() => {
        const cell = document.getElementById(`cell-${i}`);
        cell.value = num;
        cell.classList.add("solved");
      }, i * 50);
    });
  }
  
  // Trimite cererea la back-end pentru a rezolva Sudoku-ul
  async function solveSudokuBoard() {
    const inputBoard = getSudokuInput();
    try {
      const response = await fetch("/solveSudoku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: inputBoard })
      });
      if (!response.ok) throw new Error("Error solving Sudoku");
      const data = await response.json();
      animateSolution(data.solution);
    } catch (error) {
      console.error(error);
      alert("Failed to solve Sudoku");
    }
  }
  
  // Generează un puzzle aleatoriu cu cel puțin 35 de celule libere
  function generatePuzzle() {
    const solvedBoard = [
      5,3,4,6,7,8,9,1,2,
      6,7,2,1,9,5,3,4,8,
      1,9,8,3,4,2,5,6,7,
      8,5,9,7,6,1,4,2,3,
      4,2,6,8,5,3,7,9,1,
      7,1,3,9,2,4,8,5,6,
      9,6,1,5,3,7,2,8,4,
      2,8,7,4,1,9,6,3,5,
      3,4,5,2,8,6,1,7,9
    ];
    
    const puzzle = [...solvedBoard];
    let blanks = 0;
    while (blanks < 35) {
      const idx = Math.floor(Math.random() * 81);
      if (puzzle[idx] !== 0) {
        puzzle[idx] = 0;
        blanks++;
      }
    }
    
    puzzle.forEach((val, i) => {
      const cell = document.getElementById(`cell-${i}`);
      cell.value = val === 0 ? "" : val;
      cell.classList.remove("solved");
    });
  }
  
  document.getElementById("solve-btn").addEventListener("click", solveSudokuBoard);
  document.getElementById("generate-btn").addEventListener("click", generatePuzzle);
  
  // Sudoku Solver - Backtracking Algorithm (Direct in JS, No Server)
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) {
            return false;
        }
    }

    let startRow = row - (row % 3);
    let startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }

    return true;
}

function solveSudoku(board, row = 0, col = 0) {
    if (row === 9) return true;
    if (col === 9) return solveSudoku(board, row + 1, 0);
    if (board[row][col] !== 0) return solveSudoku(board, row, col + 1);

    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board, row, col + 1)) return true;
            board[row][col] = 0;
        }
    }

    return false;
}

// Rezolvă Sudoku direct în browser
function solveSudokuBoard() {
    let board = [];
    for (let i = 0; i < 9; i++) {
        board.push([]);
        for (let j = 0; j < 9; j++) {
            let cell = document.getElementById(`cell-${i * 9 + j}`);
            let value = cell.value.trim();
            board[i].push(value === "" ? 0 : parseInt(value));
        }
    }

    if (solveSudoku(board)) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = document.getElementById(`cell-${i * 9 + j}`);
                cell.value = board[i][j];
                cell.classList.add("solved");
            }
        }
    } else {
        alert("No solution found!");
    }
}

document.getElementById("clear-btn").addEventListener("click", clearBoard);

function clearBoard() {
    for (let i = 0; i < 81; i++) {
        const cell = document.getElementById(`cell-${i}`);
        cell.value = ""; // Șterge valoarea din celulă
        cell.classList.remove("solved"); // Îndepărtează stilul de soluționare
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const elements = Array.from(document.querySelectorAll("header, #hero, #about, #sudoku, #cpp-code, footer, #sudoku-board, .buttons-container"));

    // Ascundem toate elementele inițial
    elements.forEach(el => el.classList.add("hidden"));

    // Amestecăm elementele pentru a le afișa într-o ordine aleatoare
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    const shuffledElements = shuffleArray(elements);

    // Afișăm elementele treptat
    shuffledElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add("visible");
        }, index * 300); // Fiecare element apare la interval de 300ms
    });
});

function animateSolution(solution) {
    solution.forEach((num, i) => {
        setTimeout(() => {
            const cell = document.getElementById(`cell-${i}`);
            cell.value = num;
            cell.classList.add("solved", "animate");

            setTimeout(() => {
                cell.classList.remove("animate");
            }, 200);
        }, i * 50);
    });
}
