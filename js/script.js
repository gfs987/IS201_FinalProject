const rows = 12; // Number of rows
const cols = 12; // Number of columns
const mineCount = 30; // Number of mines
const gameContainer = document.getElementById("game-container");

let grid = [];
let minePositions = [];
let revealedCells = 0;
let flaggedCells = 0;
let timerInterval = null;
let timeElapsed = 0;
let gameStarted = false;
let gameOver = false; // Track the game state

// Timer elements
const timerDisplay = document.createElement("div");
timerDisplay.id = "timer";

const timeSpan = document.createElement("span");
timeSpan.id = "time";
timeSpan.textContent = "Time: 0s";

const mineCounterSpan = document.createElement("span");
mineCounterSpan.id = "mine-counter";
mineCounterSpan.textContent = ` | Mines: ${mineCount}`;

timerDisplay.appendChild(timeSpan);
timerDisplay.appendChild(mineCounterSpan);
document.body.insertBefore(timerDisplay, gameContainer);

function createGrid() {
    gameContainer.style.gridTemplateRows = `repeat(${rows}, auto)`;
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, auto)`;

    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener("click", (e) => handleClick(e, r, c));
            cell.addEventListener("contextmenu", (e) => handleRightClick(e, r, c));
            row.push(cell);
            gameContainer.appendChild(cell);
        }
        grid.push(row);
    }

    placeMines();
}

function startTimer() {
    if (gameStarted) return;
    gameStarted = true;

    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById("time").textContent = `Time: ${timeElapsed}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function placeMines() {
    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const position = `${row},${col}`;

        if (!minePositions.includes(position)) {
            minePositions.push(position);
        }
    }
}

function handleClick(event, row, col) {
    if (gameOver) return; // Disable interactions after game ends

    event.preventDefault();
    startTimer();

    const cell = grid[row][col];

    if (!gameStarted) {
        // Place mines dynamically, excluding the first clicked cell
        placeMinesWithExclusion(row, col);
        gameStarted = true;
    }

    if (event.ctrlKey) {
        toggleFlag(cell); // Handle flagging with Ctrl+Click
    } else {
        if (cell.classList.contains("flagged") || cell.classList.contains("revealed")) return;

        if (minePositions.includes(`${row},${col}`)) {
            cell.classList.add("mine");
            alert("Game Over!");
            stopTimer();
            revealAllMines();
            gameOver = true; // Set game state to over
        } else {
            revealCell(row, col);
            checkWin();
        }
    }
}

function placeMinesWithExclusion(excludeRow, excludeCol) {
    const excludedPositions = new Set();

    // Add the first cell and its neighbors to the exclusion set
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            const newRow = excludeRow + r;
            const newCol = excludeCol + c;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                excludedPositions.add(`${newRow},${newCol}`);
            }
        }
    }

    // Place mines avoiding the exclusion set
    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const position = `${row},${col}`;

        if (!excludedPositions.has(position)) {
            minePositions.push(position);
        }
    }
}


function handleRightClick(event, row, col) {
    event.preventDefault();
    if (gameOver) return; // Disable interactions after game ends

    const cell = grid[row][col];
    toggleFlag(cell);
}

function toggleFlag(cell) {
    if (cell.classList.contains("revealed")) return;

    if (cell.classList.contains("flagged")) {
        cell.classList.remove("flagged");
        cell.textContent = "";
        flaggedCells--;
        updateMineCounter();
    } else {
        if (flaggedCells < mineCount) { // Prevent over-flagging
            cell.classList.add("flagged");
            cell.textContent = "🚩";
            flaggedCells++;
            updateMineCounter();
        }
    }
}

function revealCell(row, col) {
    const cell = grid[row][col];

    if (cell.classList.contains("revealed")) return;

    cell.classList.add("revealed");
    revealedCells++;

    const mineCount = countAdjacentMines(row, col);

    if (mineCount > 0) {
        cell.textContent = mineCount;
    } else {
        revealNeighbors(row, col);
    }
}

function countAdjacentMines(row, col) {
    let count = 0;

    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;

            const newRow = row + r;
            const newCol = col + c;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols &&
                minePositions.includes(`${newRow},${newCol}`)
            ) {
                count++;
            }
        }
    }

    return count;
}

function revealNeighbors(row, col) {
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            const newRow = row + r;
            const newCol = col + c;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols
            ) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function revealAllMines() {
  minePositions.forEach((pos) => {
      const [row, col] = pos.split(",").map(Number);
      const cell = grid[row][col];

      if (!cell.classList.contains("flagged")) {
          cell.classList.add("mine");
          cell.textContent = "💣"; // Reveal the mine
      }
  });
  stopTimer();
}

const refreshButton = document.getElementById("refresh-button");

refreshButton.addEventListener("click", resetGame);

function updateMineCounter() {
    const remainingMines = mineCount - flaggedCells;
    document.getElementById("mine-counter").textContent = ` | Mines: ${remainingMines}`;
}

function placeMinesWithExclusion(excludeRow, excludeCol) {
    const excludedPositions = new Set();

    // Add the first cell and its neighbors to the exclusion set
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            const newRow = excludeRow + r;
            const newCol = excludeCol + c;

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                excludedPositions.add(`${newRow},${newCol}`);
            }
        }
    }

    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        const position = `${row},${col}`;

        if (!excludedPositions.has(position)) {
            minePositions.push(position);
        }
    }
}

function checkWin() {
  const totalCells = rows * cols;
  const nonMineCells = totalCells - mineCount;

  if (revealedCells === nonMineCells) {
      minePositions.forEach((pos) => {
          const [row, col] = pos.split(",").map(Number);
          const cell = grid[row][col];

          if (!cell.classList.contains("flagged")) {
              cell.classList.add("flagged");
              cell.textContent = "🚩"; // Automatically flag unflagged mines
          }
      });

      alert("Congratulations! You cleared the board and won the game!");
      stopTimer();
      gameOver = true; // Set game state to over
  }
}
createGrid();

function resetGame() {
    stopTimer(); // Stop the timer if it's running
    timeElapsed = 0;
    flaggedCells = 0;

    document.getElementById("time").textContent = "Time: 0s";
    document.getElementById("mine-counter").textContent = ` | Mines: ${mineCount}`;

    // Clear the game state
    grid = [];
    minePositions = [];
    revealedCells = 0;
    gameStarted = false;
    gameOver = false;

    // Clear the game board
    gameContainer.innerHTML = "";

    // Recreate the grid
    createGrid();
}
