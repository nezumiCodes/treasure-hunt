let popupVisible = false;
let gameMode = '';
const gridSize = { x: 10, y: 10 }; // grid dimensions
let gridSpacing = { x: 0, y: 0 }; // space betwen grid lines
let boardState = Array(gridSize.x).fill().map(() => Array(gridSize.y).fill(null)); // array to keep track of placed objects
let images = [];
let treasures = [];
let placedHunter = false;
let score = 0;
let rounds = 0;

document.addEventListener("DOMContentLoaded", (e) => {
    const canvas = document.getElementById("gridCanvas");
    const ctx = canvas.getContext("2d");
    const ctrlBtn = document.getElementById("ctrlBtn");
    preloadImages(canvas, ctx);

    ctrlBtn.addEventListener("click", () => toggleMode(ctrlBtn, canvas, ctx)); // toggle Setup mode

    canvas.addEventListener("click", (e) => handleClickOnCanvas(e, canvas, ctx)); // Handle cell clicks on canvas

    // Listen for keyboard events
    document.addEventListener("keydown", (e) => {
        // If popup is visible, disable keyboard events
        if (popupVisible) {
            e.preventDefault();
            return;
        }

        playGame(e, canvas, ctx);
    });

    resizeCanvas(canvas, ctx);  // resize canvas
    // Event Listeners for resizing
    window.addEventListener("load", () => resizeCanvas(canvas, ctx));
    window.addEventListener("resize", () => resizeCanvas(canvas, ctx));
});

/* _________________________________________________________________________ */
/* ________________________ UTILITY FUNCTIONS ______________________________ */
/* _________________________________________________________________________ */

/**
 * Displays alert in a popup window.
 * 
 * @param {String} alert
 * @returns {Undefined}
 */
function customAlert(alert) {
    const alertDiv = document.getElementById("custom-alert");
    alertDiv.style.display = "block";
    alertDiv.textContent = alert;

    setTimeout(() => alertDiv.style.opacity = "1", 10);

    // Start fade out after 2 seconds
    setTimeout(function () {
        alertDiv.style.opacity = "0";
        setTimeout(() => alertDiv.style.display = "none", 500);
    }, 2000);
}

/**
 * Displays popup window to handle user input.
 * 
 * Disclaimer for assignment: Promises have been used since this is a custom 
 * function that implements a window prompt. Because this creates
 * an asynchronous event, without promises the user input is not sent to the
 * client-side JavaScript.
 * 
 * @returns {Promise}
 */
function handleUserInput() {
    return new Promise((resolve, reject) => {
        const inputWindow = document.getElementById("input-window");
        const inputPrompt = document.getElementById("input-value");
        inputWindow.style.display = "block";
        inputPrompt.value = '';
        inputPrompt.focus();

        document.getElementById("okBtn").onclick = () => {
            const input = inputPrompt.value.trim();
            inputWindow.style.display = "none";
            resolve(input);
        }

        document.getElementById("cancelBtn").onclick = () => {
            inputWindow.style.display = "none";
            resolve(null);
        }
    });
}

/**
 * Resizes the canvas.
 * 
 * This function is used to dynamically resize the canvas 
 * for any viewport size.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function resizeCanvas(canvas, ctx) {
    const controlsHeight = document.getElementById('controlPanel').offsetHeight;
    const margin = 60; // Vertical margin (30px top + 30px bottom)
    const height = window.innerHeight - controlsHeight - margin;
    const width = window.innerWidth;
    const cellSize = Math.min(width / gridSize.x, height / gridSize.y);

    canvas.style.width = `${cellSize * gridSize.x}px`;
    canvas.style.height = `${cellSize * gridSize.y}px`;

    // Ensures that the width and height of the canvas are adjusted accordingly
    // when drawing the grid and content, aUndefineds image blurring
    canvas.width = cellSize * gridSize.x;
    canvas.height = cellSize * gridSize.y;

    // Redraw or adjust canvas content to fit new dimensions
    drawBoard(canvas, ctx);
}

/**
 * Preloads images before drawing the board.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function preloadImages(canvas, ctx) {
    const imgSources = {
        floor: './images/floor.png',
        hunter: './images/hunter.png',
        treasure: './images/treasure.png',
        obstacle1: './images/obstacle-1.png',
        obstacle2: './images/obstacle-2.png',
        obstacle3: './images/obstacle-3.png',
    }

    let loadedImgsCounter = 0;

    for (let src in imgSources) {
        images[src] = new Image();
        images[src].src = imgSources[src];
        images[src].onload = () => {
            loadedImgsCounter++;
            if (loadedImgsCounter === Object.keys(imgSources).length) {
                drawBoard(canvas, ctx);
            }
        }
    }
}

/**
 * Clears an item from the board.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} posX
 * @param {Number} posY
 * @returns {Undefined}
 */
function clearItemFromBoard(ctx, posX, posY) {
    ctx.clearRect(posX * gridSpacing.x, posY * gridSpacing.y, gridSpacing.x, gridSpacing.y);
}

/**
 * Resets game state and global variables.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function resetGame(canvas, ctx) {
    // Reset global variables
    score = 0;
    rounds = 0;
    placedHunter = 0;
    boardState = Array(10).fill().map(() => Array(10).fill(null));

    // Reset info values
    document.querySelectorAll('.info-value').forEach(item => item.textContent = '0');

    // Delete all internal visuals
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw board
    drawBoard(canvas, ctx);
}

/* _________________________________________________________________________ */
/* ________________________ DRAWING FUNCTIONS ______________________________ */
/* _________________________________________________________________________ */

/**
 * Draws the game board.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function drawBoard(canvas, ctx) {
    gridSpacing = {
        x: canvas.width / gridSize.x,
        y: canvas.height / gridSize.y
    };

    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += gridSpacing.x) {
        // Horizontal Lines
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += gridSpacing.y) {
        // Vertical Lines
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.strokeStyle = "white";
    ctx.stroke();

    ctx.closePath();

    drawFloor(ctx);
    drawObject(ctx);
}

/**
 * Draws the floor tiles.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function drawFloor(ctx) {
    for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
            drawImage(ctx, images["floor"], x * gridSpacing.x, y * gridSpacing.y);
        }
    }
}

/**
 * Draws obstacles, treasure and hunter in a cell.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function drawObject(ctx) {
    for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
            const cell = boardState[x][y];
            if (cell) {
                switch (cell.type) {
                    case 'treasure':
                        drawImage(ctx, images["treasure"], x * gridSpacing.x, y * gridSpacing.y);
                        break;
                    case 'obstacle':
                        drawImage(ctx, images[`obstacle${cell.index}`], x * gridSpacing.x, y * gridSpacing.y);
                        break;
                    case 'hunter':
                        drawImage(ctx, images["hunter"], x * gridSpacing.x, y * gridSpacing.y);
                        break;
                }
            }
        }
    }
}

/**
 * Utility function to draw image. 
 * 
 * This function was developed to reduce the number of parameters
 * passed when drawing images, reducing line length.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {Number} x
 * @param {Number} y
 * @returns {Undefined}
 */
function drawImage(ctx, img, x, y) {
    ctx.drawImage(img, x, y, gridSpacing.x, gridSpacing.y);
}

/**
 * Function to redraw hunter when moving on the board.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} newPos
 * @param {Object} hunterPos
 * @returns {Undefined}
 */
function redrawHunter(canvas, ctx, newPos, hunterPos) {
    clearItemFromBoard(ctx, hunterPos.x, hunterPos.y); // clear hunter image from grid

    boardState[hunterPos.x][hunterPos.y] = null;
    boardState[newPos.x][newPos.y] = { type: 'hunter' }; // set new hunter position
    drawBoard(canvas, ctx);  // re-draw grid
    drawImage(ctx, images["hunter"], newPos.x * gridSpacing.x, newPos.y * gridSpacing.y); //draw hunter in new position
}

/**
 * Creates shake animation when falling on obstacle cells.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} pos
 * @returns {Undefined}
 */
function shakeObstacle(ctx, pos) {
    const x = pos.x * gridSpacing.x;
    const y = pos.y * gridSpacing.y;

    const drawOffset = (offset) => {
        ctx.clearRect(x, y, gridSpacing.x, gridSpacing.y); // clear all cell content before animating
        drawImage(ctx, images['floor'], x, y); // draw floor first
        drawImage(ctx, images[`obstacle${boardState[pos.x][pos.y].index}`], x + offset, y);
    };

    const offsets = [0, -5, 5, -5, 0];
    let i = 0;
    const interval = setInterval(() => {
        if (i >= offsets.length) {
            clearInterval(interval);
            drawBoard();
        } else {
            drawOffset(offsets[i]);
            i++;
        }
    }, 100);
}

/* ______________________________________________________________________ */
/* ________________________ GAME FUNCTIONS ______________________________ */
/* ______________________________________________________________________ */


/* _____________________ GENERAL GAME FUNCTIONS _________________________ */

/**
 * Toggles between the various game modes.
 * 
 * The function keeps track of the gameMode variable, and 
 * whenever the ctrlBtn button is pressed, checks the current
 * game mode and proceeds to the next mode.
 * 
 * @param {HTMLButtonElement} ctrlBtn
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function toggleMode(ctrlBtn, canvas, ctx) {
    if (gameMode === '') {
        ctrlBtn.value = "End Setup";
        gameMode = "setup";
    } else if (gameMode === "setup") {
        if (!placedHunter) {
            customAlert("You must place a treasure hunter before ending the setup!");
            return;
        } else {
            gameMode = "play";
            ctrlBtn.value = "End Game";

            if (checkIfEndGame()) endGame(); // check end game conditions in case player did place a treasure during setup

            const infoValues = document.querySelectorAll('.info-value');
            const treasureCount = countTreasures();
            [5, 6, 7, 8].forEach((val, i) => {
                infoValues[i + 2].textContent = treasureCount[val] || '0';
            });

            document.getElementById("statusInfo").style.display = "flex";
        }
    } else if (gameMode === "play") {
        endGame();
        gameMode = "end";
        ctrlBtn.value = "Play Again";
    } else {
        gameMode = "setup";
        ctrlBtn.value = "End Setup";
        document.getElementById("statusInfo").style.display = "none";
        resetGame(canvas, ctx);
    }
}

/**
 * Enables placement of items on the board.
 * 
 * @param {KeyboardEvent} e
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function handleClickOnCanvas(e, canvas, ctx) {
    if (gameMode === "setup") {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; // position X within canvas
        const y = e.clientY - rect.top; // position Y within canvas
        const cellX = Math.floor(x / gridSpacing.x); // position X of cell
        const cellY = Math.floor(y / gridSpacing.y); // position Y of cell

        handleUserInput().then(input => {
            if (input !== null) {
                setupBoard(ctx, cellX, cellY, input);
            }
        });
    }
}

/**
 * Counts the number of treasures for each type.
 * 
 * @returns {Object}
 */
function countTreasures() {
    let treasureCount = { 5: 0, 6: 0, 7: 0, 8: 0 };

    boardState.forEach(row => row.forEach(cell => {
        if (cell && cell.type === "treasure") treasureCount[cell.value]++;
    }));

    return treasureCount;
}

/* _____________________ "SETUP" GAME FUNCTIONS _________________________ */

/**
 * Sets up board with obstacles, treasure and hunter.
 * 
 * Function accepts user input ('5', '6', '7', '8', 'o', 'h'),
 * draws the selected item on the board and updates the board state.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} cellX
 * @param {Number} cellY
 * @param {String} input
 * @returns {Undefined}
 */
function setupBoard(ctx, cellX, cellY, input) {
    if (boardState[cellX][cellY] !== null) {
        customAlert("An object is already placed here!");
        return;
    } else if (input === 'h' && placedHunter) {
        customAlert("The treasure hunter has already been placed!");
        return;
    }
    const x = cellX * gridSpacing.x;
    const y = cellY * gridSpacing.y;

    if (['5', '6', '7', '8'].includes(input)) {
        boardState[cellX][cellY] = { type: 'treasure', value: parseFloat(input) };
        drawImage(ctx, images["treasure"], x, y);
    }
    else if (input === 'o') {
        let obstacle = Math.floor(Math.random() * 3) + 1;
        boardState[cellX][cellY] = { type: 'obstacle', index: obstacle };
        drawImage(ctx, images[`obstacle${obstacle}`], x, y);
    } else if (input === 'h') {
        placedHunter = !placedHunter;
        boardState[cellX][cellY] = { type: 'hunter' };
        drawImage(ctx, images["hunter"], x, y);
    } else {
        customAlert("Invalid input, please enter a valid object.");
    }
}

/* _____________________ "PLAY" GAME FUNCTIONS _________________________ */

/**
 * Accepts user input to move hunter to a neighbouring cell.
 * 
 * @param {KeyboardEvent} e
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */
function playGame(e, canvas, ctx) {
    if (gameMode !== "play") return;

    const key = e.key.toLowerCase();
    switch (key) {
        case 'a': // Move left
            moveHunter(canvas, ctx, -1, 0);
            break;
        case 'w': // Move up
            moveHunter(canvas, ctx, 0, -1);
            break;
        case 's': // Move down
            moveHunter(canvas, ctx, 0, 1);
            break;
        case 'd': // Move right 
            moveHunter(canvas, ctx, 1, 0);
            break;
        default:
            customAlert("Invalid Key. Use 'A', 'W', 'S' or 'D' to move");
            break;
    }
}

/**
 * Moves hunter in the board.
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} dx
 * @param {Number} dy
 * @returns {Undefined}
 */
function moveHunter(canvas, ctx, dx, dy) {
    let hunterPos = findHunter();

    const newPos = {
        x: hunterPos.x + dx,
        y: hunterPos.y + dy
    };

    const infoValues = document.querySelectorAll('.info-value');

    // Check for obstacles and out-of-bound moves - if true, exits function
    if (checkForObstacle(ctx, newPos)) return;
    // Check if hunter lands on empty cell
    checkForEmptyCell(newPos, infoValues);
    // Check for treasure items
    checkForTreasure(ctx, newPos, infoValues);
    // Redraw hunter when moved
    redrawHunter(canvas, ctx, newPos, hunterPos);

    if (checkIfEndGame()) endGame();
}

/**
 * Checks if a cell is empty.
 * 
 * If the cell is empty, then the game rounds are inceased by 1.
 * 
 * @param {Object} pos
 * @param {NodeList<HTMLParagraphElement>} infoValues
 * @returns {Undefined}
 */
function checkForEmptyCell(pos, infoValues) {
    if (boardState[pos.x][pos.y] === null) {
        rounds++;
        infoValues[1].textContent = rounds;
    }
}

/**
 * Checks for obstacle in a cell.
 * 
 * If there is an obstacle, an alert is raised.
 * 
 * @param {Object} pos
 * @returns {boolean|Undefined}
 */
function checkForObstacle(ctx, pos) {
    if (pos.x < 0 || pos.x >= gridSize.x || pos.y < 0 || pos.y >= gridSize.y
        || (boardState[pos.x][pos.y] && boardState[pos.x][pos.y].type === "obstacle")) {
        customAlert("Invalid move");

        if ((boardState[pos.x][pos.y] && boardState[pos.x][pos.y].type === "obstacle")) shakeObstacle(ctx, pos);
        return true;
    }
}

/**
 * Checks for treasure in a cell.
 * 
 * If there is a treasure, rounds and score is increased.
 * Also, a new obstacle is placed in a random cell within the grid.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} pos
 * @param {NodeList<HTMLParagraphElement>} infoValues
 * @returns {Undefined}
 */
function checkForTreasure(ctx, pos, infoValues) {
    if ((boardState[pos.x][pos.y] && boardState[pos.x][pos.y].type === "treasure")) {
        score += boardState[pos.x][pos.y].value;
        rounds++;
        infoValues[0].textContent = score;
        infoValues[1].textContent = rounds;
        infoValues[boardState[pos.x][pos.y].value - 3].textContent =
            parseInt(infoValues[boardState[pos.x][pos.y].value - 3].textContent) - 1;

        clearItemFromBoard(ctx, pos.x, pos.y); // clear teasure image
        boardState[pos.x][pos.y] = null;

        placeRandomObstacle(ctx); // place obstacle when treasure is claimed
    }
}

/**
 * Locates current position of hunter on the board.
 * 
 * @returns {Object}
 */

function findHunter() {
    for (let x = 0; x < boardState.length; x++) {
        for (let y = 0; y < boardState[x].length; y++) {
            if (boardState[x][y] && boardState[x][y].type === "hunter") {
                return { x, y };
            }
        }
    }
}
/**
 * Places an obstacle at a random cell.
 * 
 * This function is called when the player claims a treasure.
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Undefined}
 */

function placeRandomObstacle(ctx) {
    let emptyCells = [];

    for (let x = 0; x < boardState.length; x++) {
        for (let y = 0; y < boardState[x].length; y++) {
            if (!boardState[x][y]) emptyCells.push({ x, y });
        }
    }

    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        let obstacle = Math.floor(Math.random() * 3) + 1;
        boardState[randomCell.x][randomCell.y] = { type: 'obstacle', index: obstacle };
        drawImage(ctx, images[`obstacle${obstacle}`], randomCell.x * gridSpacing.x, randomCell.y * gridSpacing.y);
    }
}

/* _____________________ "END" GAME FUNCTIONS _________________________ */

/**
 * Checks if the 'stop' stage requirements are met.
 * 
 * @returns {Boolean}
 */
function checkIfEndGame() {
    const sumTreasures = Object.values(countTreasures()).reduce((a, b) => a + b, 0);
    if (sumTreasures === 0 || isHunterStuck()) {
        return true;
    }
}

/**
 * Returns performance index if game has ended.
 * 
 * @returns {Boolean}
 */
function endGame() {
    gameMode = "end";
    ctrlBtn.value = "Play Again";
    showPerformance();
    return true;
}

/**
 * Checks if the treasure hunter is trapped between obstacles and the grid.
 * 
 * @returns {Boolean}
 */
function isHunterStuck() {
    const hunterPos = findHunter();
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    return directions.every(([dx, dy]) => {
        const newPos = {
            x: hunterPos.x + dx,
            y: hunterPos.y + dy
        };
        // Check if out of bounds
        if (newPos.x < 0 || newPos.x >= gridSize.x ||
            newPos.y < 0 || newPos.y >= gridSize.y) {
            return true;
        }

        // If not out of bounds, check for obstacle
        return boardState[newPos.x][newPos.y] &&
            boardState[newPos.x][newPos.y].type === "obstacle";
    });
}

/**
 * Calculate performance index and enable popup window.
 * 
 * @returns {Undefined}
 */
function showPerformance() {
    let performance = rounds > 0 ? (score / rounds).toFixed(2) : 0;

    // Disable keyboard events for ctrlBtn
    popupVisible = !popupVisible;
    document.getElementById("ctrlBtn").disabled = popupVisible;

    // Show performance popup
    document.getElementById('per-popup-background').style.display = 'block';
    document.getElementById('per-popup').style.display = 'block';
    document.getElementById('performance').textContent = performance;
}

/**
 * Closes performance popup window.
 * 
 * @returns {Undefined}
 */
function closePopup() {
    // Enable keyboard events for ctrlBtn
    popupVisible = !popupVisible;
    document.getElementById("ctrlBtn").disabled = popupVisible;

    // Hide performance popup
    document.getElementById('per-popup-background').style.display = 'none';
    document.getElementById('per-popup').style.display = 'none';
}