"use client";

import React, { useState, useCallback } from "react";
import { Search, Plus, X, RotateCcw, Eye } from "lucide-react";

const WordSearchGenerator = () => {
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
    setShowPuzzle(false);
    setRevealedWord(null);
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

  const isCellInRevealedWord = (row, col) => {
    if (!revealedWord) return false;
    const revealedPlacedWord = placedWords.find(
      (pw) => pw.word === revealedWord
    );
    return (
      revealedPlacedWord &&
      revealedPlacedWord.positions.some(
        (pos) => pos[0] === row && pos[1] === col
      )
    );
  };
  const revealWord = (wordToReveal) => {
    setRevealedWord(wordToReveal);
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setRevealedWord(null);
    }, 2000);
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

        {!showPuzzle ? (
          // Word Input Screen
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                Add Your Words
              </h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && addWord()}
                  placeholder="Enter a word..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  maxLength="12"
                />
                <button
                  onClick={addWord}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Grid Size: {gridSize}x{gridSize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>10x10</span>
                  <span>20x20</span>
                </div>
              </div>

              {words.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Your Words ({words.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {word}
                        </span>
                        <button
                          onClick={() => removeWord(word)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={generateGrid}
                disabled={words.length === 0}
                className="w-full px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 text-lg font-semibold"
              >
                <Search size={24} />
                Generate Word Search Puzzle
              </button>

              {words.length === 0 && (
                <p className="text-center text-gray-500 mt-4">
                  Add at least one word to generate your puzzle
                </p>
              )}
            </div>
          </div>
        ) : (
          // Puzzle Screen
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Word List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Find These Words
                  </h3>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {foundWords.size}/{placedWords.length}
                  </div>
                  <div className="text-sm text-gray-500">Words Found</div>
                </div>
                <div className="space-y-2">
                  {placedWords.map((placedWord, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-lg text-center font-medium transition-colors relative ${
                        foundWords.has(placedWord.word)
                          ? "bg-green-100 text-green-800 line-through"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                      }`}
                      onClick={() =>
                        !foundWords.has(placedWord.word) &&
                        revealWord(placedWord.word)
                      }
                      title={
                        !foundWords.has(placedWord.word)
                          ? "Click to reveal this word"
                          : ""
                      }
                    >
                      {placedWord.word}
                      {!foundWords.has(placedWord.word) && (
                        <Eye
                          size={12}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {foundWords.size === placedWords.length &&
                  placedWords.length > 0 && (
                    <div className="mt-6 text-center">
                      <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg font-semibold text-sm">
                        🎉 All words found!
                      </div>
                    </div>
                  )}
              </div>
              <button
                onClick={resetPuzzle}
                className="w-full px-4 py-2 mt-8 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                New Puzzle
              </button>
            </div>

            {/* Grid Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl text-center font-semibold mb-4 text-gray-800">
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
                              : isCellInRevealedWord(rowIndex, colIndex)
                              ? "bg-yellow-200 border-yellow-400"
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSearchGenerator;
