"use client";

import React, { useState } from "react";
import clsx from "clsx";
import AddWordsPanel from "./AddWordsPanel";
import PuzzleScreen from "./PuzzleScreen";

export default function WordSearchGenerator() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(15);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [revealedWord, setRevealedWord] = useState(null);

  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down-right
    [-1, 1], // diagonal up-right
    [0, -1], // horizontal reverse
    [-1, 0], // vertical reverse
    [-1, -1], // diagonal up-left
    [1, -1], // diagonal down-left
  ];

  const addWord = () => {
    if (
      currentWord.trim() &&
      !words.includes(currentWord.trim().toUpperCase())
    ) {
      setWords([...words, currentWord.trim().toUpperCase()]);
      setCurrentWord("");
    }
  };

  const removeWord = (wordToRemove) => {
    setWords(words.filter((word) => word !== wordToRemove));
  };

  const canPlaceWord = (grid, word, row, col, direction) => {
    const [dRow, dCol] = direction;

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;

      if (
        newRow < 0 ||
        newRow >= gridSize ||
        newCol < 0 ||
        newCol >= gridSize
      ) {
        return false;
      }

      if (grid[newRow][newCol] !== "" && grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    const [dRow, dCol] = direction;
    const positions = [];

    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      grid[newRow][newCol] = word[i];
      positions.push([newRow, newCol]);
    }

    return positions;
  };

  const generateGrid = () => {
    // Create empty grid
    const newGrid = Array(gridSize)
      .fill()
      .map(() => Array(gridSize).fill(""));
    const newPlacedWords = [];

    // Shuffle words for random placement
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    // Try to place each word
    shuffledWords.forEach((word) => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(newGrid, word, row, col, direction)) {
          const positions = placeWord(newGrid, word, row, col, direction);
          newPlacedWords.push({ word, positions, direction, found: false });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          );
        }
      }
    }

    setGrid(newGrid);
    setPlacedWords(newPlacedWords);
    setFoundWords(new Set());
    setSelectedCells([]);
    setShowPuzzle(true);
  };

  const handleMouseDown = (row, col) => {
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting && selectedCells.length > 0) {
      const start = selectedCells[0];
      const cells = getLineCells(start.row, start.col, row, col);
      setSelectedCells(cells);
    }
  };

  const handleMouseUp = () => {
    if (selectedCells.length > 1) {
      checkSelectedWord();
    }
    setIsSelecting(false);
  };

  const handleMouseLeave = () => {
    setIsSelecting(false);
  };

  const getLineCells = (startRow, startCol, endRow, endCol) => {
    const cells = [];
    const dRow = endRow === startRow ? 0 : endRow > startRow ? 1 : -1;
    const dCol = endCol === startCol ? 0 : endCol > startCol ? 1 : -1;

    // Only allow straight lines (horizontal, vertical, diagonal)
    if (
      dRow !== 0 &&
      dCol !== 0 &&
      Math.abs(endRow - startRow) !== Math.abs(endCol - startCol)
    ) {
      return [{ row: startRow, col: startCol }];
    }

    let currentRow = startRow;
    let currentCol = startCol;

    while (currentRow !== endRow + dRow || currentCol !== endCol + dCol) {
      cells.push({ row: currentRow, col: currentCol });
      currentRow += dRow;
      currentCol += dCol;
    }

    return cells;
  };

  const checkSelectedWord = () => {
    const selectedWord = selectedCells
      .map((cell) => grid[cell.row][cell.col])
      .join("");
    const reversedWord = selectedWord.split("").reverse().join("");

    placedWords.forEach((placedWord, index) => {
      if (
        (placedWord.word === selectedWord ||
          placedWord.word === reversedWord) &&
        !foundWords.has(placedWord.word)
      ) {
        setFoundWords((prev) => new Set([...prev, placedWord.word]));

        // Update the placed word as found
        setPlacedWords((prev) =>
          prev.map((pw, i) => (i === index ? { ...pw, found: true } : pw))
        );
      }
    });

    setSelectedCells([]);
  };

  const resetPuzzle = () => {
    setGrid([]);
    setPlacedWords([]);
    setFoundWords(new Set());
    setSelectedCells([]);
    setShowPuzzle(false);
    setRevealedWord(null);
  };

  const revealWord = (wordToReveal) => {
    setRevealedWord(wordToReveal);
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setRevealedWord(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div
          className={clsx(
            "grid",
            showPuzzle && "lg:grid-cols-4",
            "gap-8",
            "text-center",
            "mb-8"
          )}
        >
          <div></div>
          <div className={clsx(showPuzzle && "col-span-3")}>
            <h1 className="text-4xl font-bold text-gray mb-2">
              Word Search Generator
            </h1>
            <p className="text-gray-300">
              Create your own custom word search puzzle
            </p>
          </div>
        </div>

        {!showPuzzle ? (
          <AddWordsPanel
            addWord={addWord}
            currentWord={currentWord}
            generateGrid={generateGrid}
            gridSize={gridSize}
            removeWord={removeWord}
            setCurrentWord={setCurrentWord}
            setGridSize={setGridSize}
            words={words}
          />
        ) : (
          <PuzzleScreen
            grid={grid}
            gridSize={gridSize}
            placedWords={placedWords}
            foundWords={foundWords}
            selectedCells={selectedCells}
            isSelecting={isSelecting}
            revealedWord={revealedWord}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onRevealWord={revealWord}
            onResetPuzzle={resetPuzzle}
          />
        )}
      </div>
    </div>
  );
}
