import { Plus, Search, X } from "lucide-react";

export default function AddWordsPanel({
  addWord,
  currentWord,
  generateGrid,
  gridSize,
  removeWord,
  setCurrentWord,
  setGridSize,
  words,
}) {
  return (
    // Word Input Screen
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray text-center">
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
          disabled={words.length === 0}
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
      </div>
    </div>
  );
}
