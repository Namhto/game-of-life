const width = 100;
const height = 70;
const cellSize = 10;

let ctx;
let state = [];
let running;
let playButton, pauseButton, clearButton, coordinatesText;

function toScreenCoordinate(v) {
    return v * cellSize;
}

function fromScreenCoordinate(v) {
    return Math.floor(v / cellSize);
}

window.addEventListener('DOMContentLoaded', () => {
    ctx = document.querySelector('canvas').getContext('2d');
    playButton = document.querySelector('#play');
    pauseButton = document.querySelector('#pause');
    clearButton = document.querySelector('#clear');
    coordinatesText = document.querySelector('#coordinates');
    init();
    draw();
});

function init() {
    ctx.canvas.width = toScreenCoordinate(width);
    ctx.canvas.height = toScreenCoordinate(height);
    ctx.canvas.onclick = (event) => toggleCell(event);
    ctx.canvas.onmousemove = (event) => updateCoordinatesText(event);
    ctx.fillStyle = '#FFFFFF';

    playButton.onclick = play;
    pauseButton.onclick = pause;
    clearButton.onclick = clear;
    pause();

    for (let i = 0; i < width * height; i++) {
        state.push(false);
    }
}

function draw() {
    function drawGrid() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#3c3f41';
        for (let y = 0; y < height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, toScreenCoordinate(y));
            ctx.lineTo(toScreenCoordinate(width), toScreenCoordinate(y));
            ctx.stroke();
        }
        for (let x = 0; x < width; x++) {
            ctx.beginPath();
            ctx.moveTo(toScreenCoordinate(x), 0);
            ctx.lineTo(toScreenCoordinate(x), toScreenCoordinate(height));
            ctx.stroke();
        }
    }

    function drawCells() {
        state.forEach((isAlive, index) => {
            if (isAlive) {
                ctx.fillRect(toScreenCoordinate(index % width), toScreenCoordinate(Math.floor(index / width)), cellSize, cellSize);
            }
        });
    }

    ctx.clearRect(0, 0, toScreenCoordinate(width), toScreenCoordinate(height));
    drawGrid();
    drawCells();
}

function update() {
    function aliveNeighbours(index) {
        const x = index % width;
        const y = Math.floor(index / width);
        return [
            x - 1 + width * (y - 1), x + width * (y - 1), x + 1 + width * (y - 1),
            x - 1 + width * y, x + 1 + width * y,
            x - 1 + width * (y + 1), x + width * (y + 1), x + 1 + width * (y + 1),
        ].filter((index) => state.some((isAlive, i) => isAlive && i === index));
    }

    function shouldDie(index) {
        let aliveNeighboursCount = aliveNeighbours(index).length;
        return aliveNeighboursCount < 2 || aliveNeighboursCount > 3;
    }

    function shouldResurrect(index) {
        let aliveNeighboursCount = aliveNeighbours(index).length;
        return aliveNeighboursCount === 3;
    }

    state = state.map((isAlive, index) => isAlive ? !shouldDie(index) : shouldResurrect(index));

    if (!state.some((isAlive) => isAlive)) {
        pause();
    }
}

function loop() {
    update();
    draw();
}

function play() {
    if (state.some((isAlive) => isAlive)) {
        playButton.disabled = true;
        clearButton.disabled = true;
        pauseButton.disabled = false;
        running = setInterval(loop, 300);
    }
}

function pause() {
    clearInterval(running);
    pauseButton.disabled = true;
    playButton.disabled = false;
    clearButton.disabled = false;
}

function clear() {
    state = [];
    for (let i = 0; i < width * height; i++) {
        state.push(false);
    }
    draw();
}

function toggleCell({clientX, clientY}) {
    const x = fromScreenCoordinate(clientX - ctx.canvas.offsetLeft);
    const y = fromScreenCoordinate(clientY - ctx.canvas.offsetTop);
    state = state.map((isAlive, index) => {
        if (index === x + width * y) {
            return !isAlive;
        } else {
            return isAlive;
        }
    });
    draw();
}

function updateCoordinatesText({clientX, clientY}) {
    const x = fromScreenCoordinate(clientX - ctx.canvas.offsetLeft);
    const y = fromScreenCoordinate(clientY - ctx.canvas.offsetTop);
    coordinatesText.innerText = `x: ${x} y: ${y}`;
}