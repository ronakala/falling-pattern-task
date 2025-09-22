import React, { useState, useEffect, useRef } from 'react';
import { BlockPattern } from '../utils/pattern';

export default function BlockPatternApp() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [grid, setGrid] = useState([]);
  const [speed, setSpeed] = useState(300);
  
  const patternRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize pattern
  useEffect(() => {
    patternRef.current = new BlockPattern(rows, cols);
    setGrid([...patternRef.current.getGrid()]);
  }, []);

  // Handle grid size changes
  const handleGridSizeChange = (newRows, newCols) => {
    if (newRows >= 5 && newCols >= 5 && newRows <= 50 && newCols <= 50) {
      setRows(newRows);
      setCols(newCols);
      if (patternRef.current) {
        patternRef.current.setGridSize(newRows, newCols);
        setGrid([...patternRef.current.getGrid()]);
      }
    }
  };

  // Start simulation
  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        if (patternRef.current) {
          patternRef.current.nextGeneration();
          setGrid([...patternRef.current.getGrid()]);
        }
      }, speed);
    }
  };

  // Stop simulation
  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // Toggle cell on click
  const handleCellClick = (row, col) => {
    if (!isRunning && patternRef.current) {
      patternRef.current.toggleCell(row, col);
      setGrid([...patternRef.current.getGrid()]);
    }
  };

  // Clear grid
  const clear = () => {
    stop();
    if (patternRef.current) {
      patternRef.current.clear();
      setGrid([...patternRef.current.getGrid()]);
    }
  };

  // Load sample pattern
  const loadPattern = () => {
    stop();
    if (patternRef.current) {
      patternRef.current.loadPattern();
      setGrid([...patternRef.current.getGrid()]);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update speed
  useEffect(() => {
    if (isRunning) {
      stop();
      start();
    }
  }, [speed]);

  const getCellColor = (cell) => {
    switch (cell.type) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'red':
        return 'bg-red-600 text-white';
      default:
        return 'bg-black text-white';
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
        Falling Blocks Pattern
      </h1>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-6 mb-8 items-center justify-center bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex gap-3">
          <button
            onClick={isRunning ? stop : start}
            className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-500/25'
            } shadow-lg`}
          >
            {isRunning ? '⏸️ Stop' : '▶️ Start'}
          </button>
          <button
            onClick={clear}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🗑️ Clear
          </button>
          <button
            onClick={loadPattern}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🎲 Load Pattern
          </button>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center bg-gray-800 p-3 rounded-lg">
            <label className="text-sm mb-2 font-semibold text-gray-300">Rows</label>
            <input
              type="number"
              value={rows}
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value) || 5, cols)}
              min="5"
              max="50"
              className="w-20 px-3 py-2 rounded-md bg-gray-700 text-white text-center border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={isRunning}
            />
          </div>
          <div className="flex flex-col items-center bg-gray-800 p-3 rounded-lg">
            <label className="text-sm mb-2 font-semibold text-gray-300">Cols</label>
            <input
              type="number"
              value={cols}
              onChange={(e) => handleGridSizeChange(rows, parseInt(e.target.value) || 5)}
              min="5"
              max="50"
              className="w-20 px-3 py-2 rounded-md bg-gray-700 text-white text-center border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={isRunning}
            />
          </div>
          <div className="flex flex-col items-center bg-gray-800 p-3 rounded-lg">
            <label className="text-sm mb-2 font-semibold text-gray-300">Speed (ms)</label>
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(Math.max(100, parseInt(e.target.value) || 300))}
              min="100"
              max="2000"
              step="100"
              className="w-24 px-3 py-2 rounded-md bg-gray-700 text-white text-center border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 text-center text-sm text-gray-400 bg-gray-900 p-4 rounded-lg border border-gray-700 max-w-2xl">
        <p className="mb-2">🖱️ <strong>Click cells to cycle:</strong> Empty → Blue → Red → Green → Empty</p>
        <p>🟢 Green blocks are stable • 🔵🔴 Blue/Red blocks fall until they hit something</p>
      </div>

      {/* Grid */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700">
        <div 
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, 40px)`,
            gridTemplateRows: `repeat(${rows}, 40px)`,
            width: `${cols * 40}px`,
            height: `${rows * 40}px`
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-10 h-10 
                  border border-gray-500
                  cursor-pointer 
                  transition-all duration-200 
                  flex items-center justify-center 
                  text-xs font-bold
                  hover:scale-105 hover:z-10 hover:border-white
                  ${getCellColor(cell)} 
                  ${cell.type !== 'empty' ? 'shadow-lg' : ''}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                title={`Cell ${cell.id}: ${cell.type} ${cell.stable ? '(stable)' : '(falling)'}`}
              >
                <span className="select-none text-center">
                  {cell.id}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
        📊 Grid Size: {rows} × {cols} | Status: <span className={isRunning ? 'text-green-400' : 'text-red-400'}>
          {isRunning ? '🟢 Running' : '🔴 Stopped'}
        </span>
      </div>
    </div>
  );
}