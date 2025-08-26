"use client";

import React, { useState } from "react";
import { DIRECTION_CONFIG } from "./direction-config";
import AddWordsPanel from "./AddWordsPanel";
import PuzzleScreen from "./PuzzleScreen";

export default function WordSearchGenerator() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(10);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [revealedWord, setRevealedWord] = useState(null);
  const [startCell, setStartCell] = useState(null);

  // New state for enabled directions
  const [enabledDirections, setEnabledDirections] = useState(() => {
    const initial = {};
    DIRECTION_CONFIG.forEach((config) => {
      initial[config.id] = true; // All directions enabled by default
    });
    return initial;
  });

  const getActiveDirections = () => {
    return DIRECTION_CONFIG.filter(
      (config) => enabledDirections[config.id]
    ).map((config) => config.direction);
  };

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
    const activeDirections = getActiveDirections();

    if (activeDirections.length === 0) {
      alert("Please select at least one direction for word placement.");
      return;
    }

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
          activeDirections[Math.floor(Math.random() * activeDirections.length)];
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

  // Helper function to get cell coordinates from touch/mouse event
  const getCellFromEvent = (e) => {
    const target = e.target;
    if (!target.dataset.row || !target.dataset.col) return null;
    return {
      row: parseInt(target.dataset.row),
      col: parseInt(target.dataset.col),
    };
  };

  // Helper function to get cell from touch coordinates
  const getCellFromTouch = (touch) => {
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element || !element.dataset.row || !element.dataset.col) return null;
    return {
      row: parseInt(element.dataset.row),
      col: parseInt(element.dataset.col),
    };
  };

  // Unified selection start
  const startSelection = (row, col) => {
    setIsSelecting(true);
    setStartCell({ row, col });
    setSelectedCells([{ row, col }]);
  };

  // Unified selection update
  const updateSelection = (row, col) => {
    if (!isSelecting || !startCell) return;
    const cells = getLineCells(startCell.row, startCell.col, row, col);
    setSelectedCells(cells);
  };

  // Unified selection end
  const endSelection = () => {
    if (selectedCells.length > 1) {
      checkSelectedWord();
    }
    setIsSelecting(false);
    setStartCell(null);
  };

  // Mouse event handlers
  const handleMouseDown = (row, col) => {
    startSelection(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting) {
      updateSelection(row, col);
    }
  };

  const handleMouseUp = () => {
    endSelection();
  };

  const handleMouseLeave = () => {
    setIsSelecting(false);
    setStartCell(null);
  };

  // Touch event handlers
  const handleTouchStart = (e, row, col) => {
    e.preventDefault(); // Prevent scrolling
    startSelection(row, col);
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling
    if (!isSelecting) return;

    const touch = e.touches[0];
    const cell = getCellFromTouch(touch);
    if (cell) {
      updateSelection(cell.row, cell.col);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    endSelection();
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
    setStartCell(null);
  };

  const revealWord = (wordToReveal) => {
    setRevealedWord(wordToReveal);
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setRevealedWord(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-6 sm:px-6 lg:px-8 mx-auto">
      <div className="max-w-7xl mx-auto p-0 lg:p-8 border-0 lg:border-2 rounded-2xl border-gray-500">
        {/* Header - Mobile-first responsive */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Word Search Generator
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Create your own custom word search puzzle
          </p>
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
            enabledDirections={enabledDirections}
            setEnabledDirections={setEnabledDirections}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onRevealWord={revealWord}
            onResetPuzzle={resetPuzzle}
          />
        )}
      </div>
    </div>
  );
}
