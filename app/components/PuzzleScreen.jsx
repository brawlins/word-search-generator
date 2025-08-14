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
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
      {/* Word List - Mobile first (appears at top on mobile) */}
      <div className="order-1 lg:order-1 lg:col-span-1">
        <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-100">
              Find These Words
            </h3>
          </div>
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              {foundWords.size}/{placedWords.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Words Found</div>
          </div>

          {/* Words grid - responsive columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 mb-4">
            {placedWords.map((placedWord, index) => (
              <div
                key={index}
                className={`px-2 py-2 sm:px-3 rounded-lg text-center font-medium transition-colors relative text-sm sm:text-base ${
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
                    size={10}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-3 sm:h-3"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Success message */}
          {foundWords.size === placedWords.length && placedWords.length > 0 && (
            <div className="mb-4 text-center">
              <div className="px-3 py-2 sm:px-4 sm:py-3 bg-green-700 text-white rounded-lg font-semibold text-xs sm:text-sm">
                🎉 All words found!
              </div>
            </div>
          )}

          {/* New Puzzle Button */}
          <button
            onClick={onResetPuzzle}
            className="w-full px-3 py-2 sm:px-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RotateCcw size={14} className="sm:w-4 sm:h-4" />
            New Puzzle
          </button>
        </div>
      </div>

      {/* Grid Section - Mobile responsive */}
      <div className="order-2 lg:order-2 lg:col-span-3">
        <div className="bg-gray-800 rounded-xl shadow-lg p-3 sm:p-6 overflow-x-auto">
          <h2 className="text-lg sm:text-xl text-center font-semibold mb-3 sm:mb-4 text-gray-100">
            Word Search Puzzle
          </h2>
          <div className="flex justify-center">
            <div
              className="inline-grid p-2 sm:p-4 bg-gray-700 rounded-lg select-none"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gap: "1px",
              }}
              onMouseLeave={onMouseLeave}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-100 cursor-pointer transition-all touch-manipulation ${
                      isCellSelected(rowIndex, colIndex)
                        ? "bg-blue-500/50"
                        : isCellInRevealedWord(rowIndex, colIndex)
                        ? "bg-yellow-200/50"
                        : isCellInFoundWord(rowIndex, colIndex)
                        ? "bg-green-500/50"
                        : "bg-gray-700 hover:bg-gray-800 active:bg-gray-600"
                    }`}
                    onMouseDown={() => onMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                    onMouseUp={onMouseUp}
                    onTouchStart={() => onMouseDown(rowIndex, colIndex)}
                    onTouchEnd={onMouseUp}
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
  );
}
