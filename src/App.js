
import React, { useState, useEffect } from "react";

// ゲームフィールドのサイズ
const ROWS = 20;
const COLS = 10;

// テトリミノの形状
const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

const getRandomTetromino = () => {
  const tetrominoKeys = Object.keys(TETROMINOES);
  const randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  return { shape: TETROMINOES[randomKey], x: 4, y: 0 }; // 初期位置
};

const App = () => {
  const [field, setField] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [currentTetromino, setCurrentTetromino] = useState(getRandomTetromino());
  const [gameOver, setGameOver] = useState(false);

  // ブロックを描画する
  const drawTetromino = (tetromino, field) => {
    const newField = field.map((row) => [...row]);
    const { shape, x, y } = tetromino;
    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          newField[y + rowIndex][x + colIndex] = cell;
        }
      });
    });
    return newField;
  };

  // テトリミノを移動する
  const moveTetromino = (dx, dy) => {
    const newTetromino = { ...currentTetromino, x: currentTetromino.x + dx, y: currentTetromino.y + dy };
    if (!checkCollision(newTetromino, field)) {
      setCurrentTetromino(newTetromino);
    } else if (dy > 0) {
      // 下に移動できない場合は固定
      const updatedField = drawTetromino(currentTetromino, field);
      clearLines(updatedField);
      const nextTetromino = getRandomTetromino();
      if (checkCollision(nextTetromino, updatedField)) {
        setGameOver(true);
      } else {
        setCurrentTetromino(nextTetromino);
        setField(updatedField);
      }
    }
  };

  // テトリミノを回転する
  const rotateTetromino = () => {
    const { shape, x, y } = currentTetromino;
    const rotatedShape = shape[0].map((_, colIndex) => shape.map((row) => row[colIndex]).reverse());
    const rotatedTetromino = { ...currentTetromino, shape: rotatedShape };
    if (!checkCollision(rotatedTetromino, field)) {
      setCurrentTetromino(rotatedTetromino);
    }
  };

  // 衝突チェック
  const checkCollision = (tetromino, field) => {
    const { shape, x, y } = tetromino;
    return shape.some((row, rowIndex) =>
      row.some((cell, colIndex) => {
        if (cell) {
          const newX = x + colIndex;
          const newY = y + rowIndex;
          return newY >= ROWS || newX < 0 || newX >= COLS || (newY >= 0 && field[newY][newX]);
        }
        return false;
      })
    );
  };

  // 行を消去する
  const clearLines = (field) => {
    const clearedField = field.filter((row) => row.some((cell) => !cell));
    const clearedLines = ROWS - clearedField.length;
    const newField = Array.from({ length: clearedLines }, () => Array(COLS).fill(0)).concat(clearedField);
    setField(newField);
  };

  // キーボード操作
  const handleKeyDown = (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") moveTetromino(-1, 0);
    if (e.key === "ArrowRight") moveTetromino(1, 0);
    if (e.key === "ArrowDown") moveTetromino(0, 1);
    if (e.key === "ArrowUp") rotateTetromino();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      moveTetromino(0, 1); // テトリミノを自動で下に移動
    }, 500);
    return () => clearInterval(timer);
  }, [currentTetromino]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTetromino]);

  // フィールドとテトリミノを描画
  const combinedField = drawTetromino(currentTetromino, field);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>テトリスゲーム</h1>
      {gameOver ? (
        <h2>ゲームオーバー</h2>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 30px)`,
            gap: "2px",
            justifyContent: "center",
          }}
        >
          {combinedField.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: cell ? "blue" : "lightgray",
                  border: "1px solid #ccc",
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;