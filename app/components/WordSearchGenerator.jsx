"use client";

import React, { useState, useCallback } from "react";
import { Search, Plus, X, RotateCcw } from "lucide-react";

const WordSearchGenerator = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(15);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

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
  };

  const getCellKey = (row, col) => `${row}-${col}`;

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
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some((cell) => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row, col) => {
    return placedWords.some(
      (placedWord) =>
        placedWord.found &&
        placedWord.positions.some((pos) => pos[0] === row && pos[1] === col)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Word Search Generator
          </h1>
          <p className="text-gray-600">
            Create your own custom word search puzzle
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Word Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Add Words
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && addWord()}
                  placeholder="Enter a word..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="12"
                />
                <button
                  onClick={addWord}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Size: {gridSize}x{gridSize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 mb-6">
                {words.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">{word}</span>
                    <button
                      onClick={() => removeWord(word)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={generateGrid}
                  disabled={words.length === 0}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  Generate Puzzle
                </button>

                {grid.length > 0 && (
                  <button
                    onClick={resetPuzzle}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    Reset Puzzle
                  </button>
                )}
              </div>
            </div>

            {/* Word List */}
            {placedWords.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Find These Words ({foundWords.size}/{placedWords.length})
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {placedWords.map((placedWord, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-lg text-center font-medium transition-colors ${
                        foundWords.has(placedWord.word)
                          ? "bg-green-100 text-green-800 line-through"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {placedWord.word}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Section */}
          <div className="lg:col-span-2">
            {grid.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Word Search Puzzle
                </h2>
                <div className="flex justify-center">
                  <div
                    className="inline-grid gap-1 p-4 bg-gray-50 rounded-lg select-none"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                    onMouseLeave={() => setIsSelecting(false)}
                  >
                    {grid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <div
                          key={getCellKey(rowIndex, colIndex)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-bold border border-gray-300 cursor-pointer transition-all ${
                            isCellSelected(rowIndex, colIndex)
                              ? "bg-blue-200 border-blue-400"
                              : isCellInFoundWord(rowIndex, colIndex)
                              ? "bg-green-200 border-green-400"
                              : "bg-white hover:bg-gray-100"
                          }`}
                          onMouseDown={() =>
                            handleMouseDown(rowIndex, colIndex)
                          }
                          onMouseEnter={() =>
                            handleMouseEnter(rowIndex, colIndex)
                          }
                          onMouseUp={handleMouseUp}
                        >
                          {cell}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {foundWords.size === placedWords.length &&
                  placedWords.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold">
                        🎉 Congratulations! You found all the words!
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Puzzle Yet
                </h3>
                <p className="text-gray-500">
                  Add some words on the left and generate your puzzle!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearchGenerator;
