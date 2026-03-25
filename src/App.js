import React, { useState, useEffect } from "react";
import "./App.css";

// 🔥 Initial Board
const initialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const back = ['r','n','b','q','k','b','n','r'];

  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: back[i], color: "black" };
    board[1][i] = { type: "p", color: "black" };

    board[6][i] = { type: "p", color: "white" };
    board[7][i] = { type: back[i], color: "white" };
  }

  return board;
};

// ♟️ Symbols
const symbols = {
  p: "♙",
  r: "♖",
  n: "♘",
  b: "♗",
  q: "♕",
  k: "♔"
};

function App() {
  const [board, setBoard] = useState(initialBoard());
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("white");
  const [moves, setMoves] = useState([]);
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [check, setCheck] = useState(null);

  // ⏱ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (turn === "white") setWhiteTime(t => t - 1);
      else setBlackTime(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [turn]);

  // 🔥 Move Validation
  const isValidMove = (from, to) => {
    const piece = board[from.row][from.col];
    const target = board[to.row][to.col];

    if (!piece) return false;
    if (target && target.color === piece.color) return false;

    const dx = to.row - from.row;
    const dy = to.col - from.col;

    if (piece.type === "p") {
      const dir = piece.color === "white" ? -1 : 1;
      if (dy === 0 && !target && dx === dir) return true;
      if (Math.abs(dy) === 1 && dx === dir && target) return true;
      return false;
    }

    if (piece.type === "r") return dx === 0 || dy === 0;
    if (piece.type === "b") return Math.abs(dx) === Math.abs(dy);
    if (piece.type === "q")
      return dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);

    if (piece.type === "n")
      return (
        (Math.abs(dx) === 2 && Math.abs(dy) === 1) ||
        (Math.abs(dx) === 1 && Math.abs(dy) === 2)
      );

    if (piece.type === "k")
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;

    return false;
  };

  // 🔥 Handle Click
  const handleClick = (row, col) => {
    const piece = board[row][col];

    if (selected) {
      const movingPiece = board[selected.row][selected.col];

      if (movingPiece.color !== turn) {
        setSelected(null);
        return;
      }

      if (!isValidMove(selected, { row, col })) {
        setSelected(null);
        return;
      }

      const newBoard = board.map(r => [...r]);

      newBoard[row][col] = movingPiece;
      newBoard[selected.row][selected.col] = null;

      setBoard(newBoard);
      setSelected(null);

      const notation = `${movingPiece.type}${String.fromCharCode(97 + col)}${8 - row}`;
      setMoves(prev => [...prev, notation]);

      setTurn(turn === "white" ? "black" : "white");

    } else {
      if (piece && piece.color === turn) {
        setSelected({ row, col });
      }
    }
  };

  // 🔥 Check Detection (FIXED)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const findKing = (color) => {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (board[i][j]?.type === "k" && board[i][j].color === color) {
            return { row: i, col: j };
          }
        }
      }
    };

    const king = findKing(turn);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.color !== turn) {
          if (isValidMove({ row: i, col: j }, king)) {
            setCheck(turn);
            return;
          }
        }
      }
    }

    setCheck(null);
  }, [board, turn]);

  return (
    <div className="container">

      <div className="header">
        <h1>Chess Game</h1>
        <h2>Turn: {turn}</h2>
        <p>White Time: {whiteTime}s</p>
        <p>Black Time: {blackTime}s</p>
        {check && <h3 className="check">CHECK on {check}!</h3>}
      </div>

      <div className="game">

        <div className="board">
          {board.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`cell 
                  ${(i + j) % 2 === 0 ? "white" : "black"} 
                  ${selected && selected.row === i && selected.col === j ? "selected" : ""}
                `}
                onClick={() => handleClick(i, j)}
              >
                {cell && (
                  <span className={cell.color}>
                    {symbols[cell.type]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="side">
          <h3>Move List</h3>
          {moves.map((m, i) => (
            <div key={i}>{i + 1}. {m}</div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;