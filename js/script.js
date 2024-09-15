function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const putMark = (cell, player) => {
    console.log(`Marking cell with ${player}`);
    cell.addMark(player); // Mark the cell
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, printBoard, putMark };
}

function Cell() {
  let value = 0;

  const addMark = (player) => {
    console.log(`addMark called with player ${player}`);
    value = player;
  };

  const getValue = () => value;

  return { addMark, getValue };
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
    },
    {
      name: playerTwoName,
      mark: 2,
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

    if (firstDiagonal.every((cell) => cell.getValue() === player.mark)) {
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
        eventEmitter.emit("validMove", { cell, player: activePlayer });
      }
    } else if (cell.getValue() === activePlayer.mark) {
      eventEmitter.emit("invalidMove", { cell, player: activePlayer });
    } else {
      eventEmitter.emit("occupiedCell", { cell });
    }
  };

  // Initial play game message
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    on: eventEmitter.on,
    emit: eventEmitter.emit,
  };
}

function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const guideDiv = document.querySelector(".guide");

  const updateScreen = () => {
    boardDiv.textContent = "";

    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    board.forEach((row, rowIndex) => {
      row.forEach((cell, index) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.row = rowIndex;
        cellButton.dataset.column = index;
        cellButton.textContent = cell.getValue();
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
    console.log("playerWon emit");
    updateScreen();
    playerTurnDiv.textContent = `${game.getActivePlayer().name} has won!`;
    guideDiv.textContent = "";
  });

  // Initial render
  updateScreen();
}
ScreenController();
