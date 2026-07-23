const board = document.getElementById("game-board");

for (let i = 0; i < 100; i++) {

    const square = document.createElement("div");

    square.classList.add("square");

    board.appendChild(square);

}
