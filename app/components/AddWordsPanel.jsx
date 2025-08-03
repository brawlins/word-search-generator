import React from "react";
import { Plus, Search, X } from "lucide-react";
import { DIRECTION_CONFIG } from "./direction-config";

export default function AddWordsPanel({
  addWord,
  currentWord,
  generateGrid,
  gridSize,
  removeWord,
  setCurrentWord,
  setGridSize,
  words,
  enabledDirections,
  setEnabledDirections,
}) {
  const handleDirectionToggle = (directionId) => {
    setEnabledDirections((prev) => ({
      ...prev,
      [directionId]: !prev[directionId],
    }));
  };

  const handleCheckAll = () => {
    const allChecked = Object.values(enabledDirections).every((val) => val);
    const newState = {};
    DIRECTION_CONFIG.forEach((config) => {
      newState[config.id] = !allChecked;
    });
    setEnabledDirections(newState);
  };

  const allChecked = Object.values(enabledDirections).every((val) => val);
  const someChecked = Object.values(enabledDirections).some((val) => val);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100 text-center">
          Add Words
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
            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-300 mb-3">
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
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>10x10</span>
            <span>20x20</span>
          </div>
        </div>

        {/* Direction Controls */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-300 mb-3">
            Word Directions
          </label>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-3 pb-3 border-b border-gray-600">
              <input
                type="checkbox"
                id="checkAll"
                checked={allChecked}
                ref={(input) => {
                  if (input) input.indeterminate = someChecked && !allChecked;
                }}
                onChange={handleCheckAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="checkAll"
                className="ml-2 text-sm font-medium text-gray-200"
              >
                {allChecked ? "Uncheck All" : "Check All"}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DIRECTION_CONFIG.map((config) => (
                <div key={config.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={config.id}
                    checked={enabledDirections[config.id]}
                    onChange={() => handleDirectionToggle(config.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={config.id}
                    className="ml-2 text-sm text-gray-200"
                  >
                    {config.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {words.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-300 mb-3">
              Your Words ({words.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg"
                >
                  <span className="font-medium text-gray-200">{word}</span>
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
          disabled={words.length === 0 || !someChecked}
          className="w-full px-6 py-4 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 text-lg font-semibold"
        >
          <Search size={24} />
          Generate Word Search Puzzle
        </button>

        {words.length === 0 && (
          <p className="text-center text-gray-400 mt-4">
            Add at least one word to generate your puzzle
          </p>
        )}
        {words.length > 0 && !someChecked && (
          <p className="text-center text-gray-400 mt-4">
            Select at least one direction to generate your puzzle
          </p>
        )}
      </div>
    </div>
  );
}
