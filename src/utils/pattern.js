// Pattern.js logic encapsulated as a class
export class BlockPattern {
  constructor(rows = 20, cols = 10) {
    this.rows = rows;
    this.cols = cols;
    this.grid = this.createEmptyGrid();
    this.generation = 0;
    this.blockTypes = ['empty', 'blue', 'red', 'green'];
  }

  createEmptyGrid() {
    const grid = [];
    let cellNumber = 1;
    for (let i = 0; i < this.rows; i++) {
      const row = [];
      for (let j = 0; j < this.cols; j++) {
        row.push({
          id: cellNumber++,
          type: 'empty',
          stable: false
        });
      }
      grid.push(row);
    }
    return grid;
  }

  setGridSize(rows, cols) {
    const oldRows = this.rows;
    const oldCols = this.cols;
    this.rows = rows;
    this.cols = cols;
    
    const newGrid = this.createEmptyGrid();
    
    // Copy existing cells if possible
    if (this.grid) {
      for (let i = 0; i < Math.min(oldRows, rows); i++) {
        for (let j = 0; j < Math.min(oldCols, cols); j++) {
          newGrid[i][j] = {
            ...this.grid[i][j],
            id: i * cols + j + 1
          };
        }
      }
    }
    
    this.grid = newGrid;
    return this.grid;
  }

  toggleCell(row, col) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      const currentType = this.grid[row][col].type;
      const typeIndex = this.blockTypes.indexOf(currentType);
      const nextType = this.blockTypes[(typeIndex + 1) % this.blockTypes.length];
      
      this.grid[row][col] = {
        ...this.grid[row][col],
        type: nextType,
        stable: nextType === 'green' || nextType === 'empty'
      };
    }
    return this.grid;
  }

  // Simulate falling blocks with stacking behavior
  nextGeneration() {
    const newGrid = JSON.parse(JSON.stringify(this.grid));
    let hasChanges = false;

    // Create green blocks at top randomly
    if (Math.random() < 0.3) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.random() < 0.1 && newGrid[0][j].type === 'empty') {
          newGrid[0][j] = {
            ...newGrid[0][j],
            type: 'green',
            stable: true
          };
          hasChanges = true;
        }
      }
    }

    // Ensure bottom row stays green if it should be
    for (let j = 0; j < this.cols; j++) {
      if (this.grid[this.rows - 1][j].type === 'green') {
        newGrid[this.rows - 1][j] = {
          ...newGrid[this.rows - 1][j],
          type: 'green',
          stable: true
        };
      }
    }

    // Process falling blocks from bottom to top
    for (let i = this.rows - 2; i >= 0; i--) {
      for (let j = 0; j < this.cols; j++) {
        const cell = newGrid[i][j];
        
        if ((cell.type === 'blue' || cell.type === 'red') && !cell.stable) {
          // Check if can fall down
          if (i < this.rows - 1 && newGrid[i + 1][j].type === 'empty') {
            // Move block down
            newGrid[i + 1][j] = {
              ...cell,
              stable: false
            };
            newGrid[i][j] = {
              ...newGrid[i][j],
              type: 'empty',
              stable: false
            };
            hasChanges = true;
          } else {
            // Block hits something, make it stable
            newGrid[i][j] = {
              ...cell,
              stable: true
            };
          }
        }
      }
    }

    // Randomly spawn new falling blocks
    if (Math.random() < 0.4) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.random() < 0.15 && newGrid[0][j].type === 'empty') {
          newGrid[0][j] = {
            ...newGrid[0][j],
            type: Math.random() < 0.5 ? 'blue' : 'red',
            stable: false
          };
          hasChanges = true;
        }
      }
    }

    // Add some color changes to existing blocks
    if (Math.random() < 0.2) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          if (newGrid[i][j].type === 'blue' && newGrid[i][j].stable && Math.random() < 0.1) {
            newGrid[i][j] = {
              ...newGrid[i][j],
              type: 'red'
            };
            hasChanges = true;
          } else if (newGrid[i][j].type === 'red' && newGrid[i][j].stable && Math.random() < 0.1) {
            newGrid[i][j] = {
              ...newGrid[i][j],
              type: 'blue'
            };
            hasChanges = true;
          }
        }
      }
    }

    this.grid = newGrid;
    this.generation++;
    return this.grid;
  }

  clear() {
    this.grid = this.createEmptyGrid();
    this.generation = 0;
    return this.grid;
  }

  loadPattern() {
    // Load a pattern similar to the image
    this.clear();
    
    // Add green blocks at top row
    for (let j = 0; j < this.cols; j++) {
      this.grid[0][j] = {
        ...this.grid[0][j],
        type: 'green',
        stable: true
      };
    }

    // Add green blocks at bottom row
    for (let j = 0; j < this.cols; j++) {
      this.grid[this.rows - 1][j] = {
        ...this.grid[this.rows - 1][j],
        type: 'green',
        stable: true
      };
    }

    // Add some initial falling pattern
    const patterns = [
      // Create some blue and red blocks in middle sections
      { rows: [2, 3, 4], cols: [1, 2, 4, 5], type: 'blue' },
      { rows: [2, 3, 4], cols: [6, 8, 9], type: 'red' },
      { rows: [5, 6, 7], cols: [3, 4, 5, 7], type: 'blue' },
      { rows: [5, 6, 7], cols: [8, 9], type: 'red' },
      { rows: [8, 9, 10], cols: [1, 3, 6, 8], type: 'blue' },
      { rows: [8, 9, 10], cols: [2, 4, 7, 9], type: 'red' },
    ];

    patterns.forEach(pattern => {
      pattern.rows.forEach(row => {
        pattern.cols.forEach(col => {
          if (row < this.rows - 1 && col < this.cols) { // Don't overwrite bottom green row
            this.grid[row][col] = {
              ...this.grid[row][col],
              type: pattern.type,
              stable: Math.random() < 0.7
            };
          }
        });
      });
    });

    return this.grid;
  }

  getGrid() {
    return this.grid;
  }
}