import React from "react";
import { Eye, RotateCcw } from "lucide-react";

export default function PuzzleScreen({
  grid,
  gridSize,
  placedWords,
  foundWords,
  selectedCells,
  revealedWord,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onMouseLeave,
  onRevealWord,
  onResetPuzzle,
}) {
  const getCellKey = (row, col) => `${row}-${col}`;

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

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Word List Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Find These Words
            </h3>
          </div>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-green-400">
              {foundWords.size}/{placedWords.length}
            </div>
            <div className="text-sm text-gray-300">Words Found</div>
          </div>
          <div className="space-y-2">
            {placedWords.map((placedWord, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-lg text-center font-medium transition-colors relative ${
                  foundWords.has(placedWord.word)
                    ? "bg-green-700 text-green-200 line-through"
                    : "bg-gray-600 text-gray-200 hover:bg-gray-700 cursor-pointer"
                }`}
                onClick={() =>
                  !foundWords.has(placedWord.word) &&
                  onRevealWord(placedWord.word)
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

          {foundWords.size === placedWords.length && placedWords.length > 0 && (
            <div className="mt-6 text-center">
              <div className="px-4 py-3 bg-green-700 text-white rounded-lg font-semibold text-sm">
                🎉 All words found!
              </div>
            </div>
          )}
          <button
            onClick={onResetPuzzle}
            className="w-full px-4 py-2 mt-8 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            New Puzzle
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="lg:col-span-3">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 pb-9">
          <h2 className="text-xl text-center font-semibold mb-4 text-gray-100">
            Word Search Puzzle
          </h2>
          <div className="flex justify-center">
            <div
              className="inline-grid p-4 bg-gray-700 rounded-lg select-none"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              onMouseLeave={onMouseLeave}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div key={`${rowIndex}-${colIndex}`}>
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-100 border-none cursor-pointer transition-all ${
                        isCellSelected(rowIndex, colIndex)
                          ? "bg-blue-500/50"
                          : isCellInRevealedWord(rowIndex, colIndex)
                          ? "bg-yellow-200/50"
                          : isCellInFoundWord(rowIndex, colIndex)
                          ? "bg-green-500/50"
                          : "bg-gray-700 hover:bg-gray-800"
                      }`}
                      onMouseDown={() => onMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                      onMouseUp={onMouseUp}
                    >
                      {cell}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}