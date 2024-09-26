function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      let newCell = new Cell(i, j);
      board[i].push(newCell);
    }
  }

  const getBoard = () => board;

  const putMark = (cell = 0, player = 0) => {
    console.log(`Marking cell with ${player}`);
    cell.addMark(player); // Mark the cell
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
  };

  return { getBoard, printBoard, putMark };
}

function Cell(rowIndex, columnIndex) {
  let value = 0;
  let row = rowIndex;
  let column = columnIndex;

  const addMark = (player) => {
    console.log(`addMark called with player ${player}`);
    value = player;
  };

  const removeMark = () => {
    value = 0;
  };

  const getValue = () => value;

  const getCellIndexes = () => {
    return [row, column];
  };

  return { addMark, removeMark, getValue, getCellIndexes };
}

function EventEmitter() {
  const events = {};

  function on(event, listener) {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(listener);
  }

  function emit(event, data) {
    if (events[event]) {
      events[event].forEach((listener) => listener(data));
    }
  }

  return {
    on,
    emit,
  };
}

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two"
) {
  const board = Gameboard();
  const eventEmitter = EventEmitter();

  const players = [
    {
      name: playerOneName,
      mark: 1,
      points: 0,
    },
    {
      name: playerTwoName,
      mark: 2,
      points: 0,
    },
  ];

  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const playerWon = (player) => {
    // Check each rows for a winning condition
    const winningRow = board
      .getBoard()
      .find((row) => row.every((cell) => cell.getValue() === player.mark));

    if (winningRow) {
      eventEmitter.emit("playerWin", { winningRow: winningRow });
      return true;
    }

    // Check each columns for a winning condition
    for (let col = 0; col < 3; col++) {
      const columnCells = board.getBoard().map((row) => row[col]);

      if (columnCells.every((cell) => cell.getValue() === player.mark)) {
        eventEmitter.emit("playerWin", { winningRow: columnCells });
        return true;
      }
    }

    // Check both diagonals for winning condition
    const firstDiagonal = board.getBoard().map((row, index) => row[index]);

    if (firstDiagonal.every((cell) => cell.getValue() === player.mark)) {
      eventEmitter.emit("playerWin", { winningRow: firstDiagonal });
      return true;
    }

    const secondDiagonal = board.getBoard().map((row, index) => row[2 - index]);

    if (secondDiagonal.every((cell) => cell.getValue() === player.mark)) {
      eventEmitter.emit("playerWin", { winningRow: secondDiagonal });
      return true;
    }
    return false;
  };

  const playRound = (cell) => {
    if (cell.getValue() === 0) {
      board.putMark(cell, getActivePlayer().mark);
      if (!playerWon(getActivePlayer())) {
        switchPlayerTurn();
        printNewRound();
        eventEmitter.emit("validMove", {
          cell,
          player: activePlayer,
        });
      }
    } else if (cell.getValue() === activePlayer.mark) {
      eventEmitter.emit("invalidMove", { cell, player: activePlayer });
    } else {
      eventEmitter.emit("occupiedCell", { cell });
    }
  };

  const getNameOfPlayer = (playerIndex) => players[playerIndex].name;

  const setPlayerName = (playerIndex, name) => {
    players[playerIndex].name = name;
  };

  const addPointToWinner = () => {
    activePlayer.points++;
  };

  const getPointsOfPlayer = (playerIndex) => players[playerIndex].points;

  const resetBoard = () => {
    board.getBoard().forEach((row) => row.forEach((cell) => cell.removeMark()));
    switchPlayerTurn();
  };

  // Initial play game message
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getNameOfPlayer,
    setPlayerName,
    getPointsOfPlayer,
    addPointToWinner,
    resetBoard,
    on: eventEmitter.on,
    emit: eventEmitter.emit,
  };
}

function ScreenController() {
  const boardContainer = document.querySelector(".game-wrapper");
  boardContainer.style.display = "none";

  const startGameButton = document.querySelector(".start");
  startGameButton.addEventListener("click", checkFilledNames, false);

  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const guideDiv = document.querySelector(".guide");

  const playerOneName = document.querySelector(".player-one-name");
  const playerTwoName = document.querySelector(".player-two-name");
  const playerOnePoints = document.querySelector(".player-one-points");
  const playerTwoPoints = document.querySelector(".player-two-points");

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();
    playerOnePoints.textContent = game.getPointsOfPlayer(0);
    playerTwoPoints.textContent = game.getPointsOfPlayer(1);
    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    board.forEach((row, rowIndex) => {
      row.forEach((cell, index) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = index;
        if (cell.getValue() === 1) {
          cellButton.classList.add("nought");
        } else if (cell.getValue() === 2) {
          cellButton.classList.add("cross");
        }
        cellButton.addEventListener("click", clickHandlerBoard);
        boardDiv.appendChild(cellButton);
      });
    });
  };

  function clickHandlerBoard(e) {
    const selectedCell =
      game.getBoard()[e.target.dataset.row][e.target.dataset.column];

    if (!selectedCell) return;

    game.playRound(selectedCell);
  }

  function checkFilledNames(event) {
    event.preventDefault();
    const menu = document.querySelector(".menu");

    const playerOneInput = document.querySelector("#player-one").value;
    const playerTwoInput = document.querySelector("#player-two").value;

    if (playerOneInput !== "" && playerTwoInput !== "") {
      menu.style.display = "none";
      boardContainer.style.display = "grid";

      game.setPlayerName(0, playerOneInput);
      game.setPlayerName(1, playerTwoInput);
      playerOneName.textContent = game.getNameOfPlayer(0);
      playerTwoName.textContent = game.getNameOfPlayer(1);
      // Initial render
      updateScreen();
    }
  }

  function determineLineCoords(winningLine) {
    const [startRow, startColumn] = winningLine[0].getCellIndexes();
    const [endRow, endColumn] = winningLine[2].getCellIndexes();
    const cellSize = 580 / 3;
    const offset = cellSize / 2;
    let x1, y1, x2, y2;

    if (startRow === endRow) {
      // winningLine is a row
      x1 = 0;
      y1 = cellSize * endRow + offset;
      x2 = 580;
      y2 = cellSize * endRow + offset;
      // winningLine is a column
    } else if (startColumn === endColumn) {
      x1 = cellSize * startColumn + offset;
      y1 = 0;
      x2 = cellSize * endColumn + offset;
      y2 = 580;
    } else {
      // winningLine is a diagonal
      if (startRow < endRow && startColumn < endColumn) {
        x1 = y1 = 0;
        x2 = y2 = 580;
      } else {
        x1 = y2 = 0;
        y1 = x2 = 580;
      }
    }
    return [x1, y1, x2, y2];
  }

  function highlightWinningLine(winningLine) {
    winningLine.forEach((cell) => console.log(cell.getCellIndexes()));
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("cross-line");
    svg.setAttributeNS(
      "http://www.w3.org/2000/xmlns/",
      "xmlns:xlink",
      "http://www.w3.org/1999/xlink"
    );
    document.body.appendChild(svg);
    let newLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );

    const lineCoordinates = determineLineCoords(winningLine);
    console.log(typeof lineCoordinates);
    newLine.setAttribute("x1", lineCoordinates[0]);
    newLine.setAttribute("y1", lineCoordinates[1]);
    newLine.setAttribute("x2", lineCoordinates[2]);
    newLine.setAttribute("y2", lineCoordinates[3]);

    svg.appendChild(newLine);
    boardDiv.appendChild(svg);
  }

  function endOfGame(e) {
    e.stopPropagation();
    game.resetBoard();
    updateScreen();
    boardDiv.removeEventListener("click", endOfGame, { capture: true });
    guideDiv.textContent = "";
  }

  game.on("validMove", () => {
    updateScreen();
    guideDiv.textContent = "";
  });

  game.on("invalidMove", () => {
    guideDiv.textContent = "You already own this cell! Try another one";
  });
  game.on("occupiedCell", () => {
    guideDiv.textContent = "Cell already occupied! Try another one";
  });

  game.on("playerWin", ({ winningRow }) => {
    game.addPointToWinner();

    updateScreen();
    highlightWinningLine(winningRow);
    playerTurnDiv.textContent = `${game.getActivePlayer().name} has won!`;
    guideDiv.textContent = "Click anywhere on the board for new round.";
    boardDiv.addEventListener("click", endOfGame, { capture: true });
  });
}
ScreenController();
