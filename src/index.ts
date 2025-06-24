// Game canvas setup
const canvas = document.getElementById('game') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');

// Game constants
const BOARD_ROWS = 3;
const BOARD_COLS = 4;
const CELL_SIZE = 120;
const UNIT_RADIUS = 35;

// Starting unit stats
const DEFAULT_ATT = 25;
const DEFAULT_LIF = 100;

// Game state
interface Unit {
  team: 1 | 2;
  row: number;
  col: number;
  att: number;  // Attack damage
  lif: number;  // Life points (current health)
  maxLif: number; // Maximum life points
  isAlive: boolean;
}

interface GameState {
  board: (Unit | null)[][];
  cellWidth: number;
  cellHeight: number;
  boardOffsetX: number;
  boardOffsetY: number;
}

let gameState: GameState;
let lastTime = 0;

// Create a new unit
function createUnit(team: 1 | 2, row: number, col: number): Unit {
  return {
    team: team,
    row: row,
    col: col,
    att: DEFAULT_ATT,
    lif: DEFAULT_LIF,
    maxLif: DEFAULT_LIF,
    isAlive: true
  };
}

// Initialize the game board
function initializeBoard(): (Unit | null)[][] {
  const board: (Unit | null)[][] = [];
  
  for (let row = 0; row < BOARD_ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      // Left side (columns 0-1) is team 1, right side (columns 2-3) is team 2
      if (col < 2) {
        board[row][col] = createUnit(1, row, col);
      } else {
        board[row][col] = createUnit(2, row, col);
      }
    }
  }
  
  return board;
}

// Calculate board dimensions and positioning
function calculateBoardLayout() {
  if (!canvas) return;
  
  const boardWidth = BOARD_COLS * CELL_SIZE;
  const boardHeight = BOARD_ROWS * CELL_SIZE;
  
  gameState.cellWidth = CELL_SIZE;
  gameState.cellHeight = CELL_SIZE;
  gameState.boardOffsetX = (canvas.width - boardWidth) / 2;
  gameState.boardOffsetY = (canvas.height - boardHeight) / 2;
}

// Check if a unit is dead and should be removed
function updateUnitStatus(unit: Unit) {
  if (unit.lif <= 0) {
    unit.isAlive = false;
    unit.lif = 0;
  }
}

// Deal damage to a unit
function damageUnit(unit: Unit, damage: number) {
  unit.lif -= damage;
  updateUnitStatus(unit);
}

// Get health percentage for visual representation
function getHealthPercentage(unit: Unit): number {
  return unit.lif / unit.maxLif;
}

// Draw the game board
function drawBoard() {
  if (!ctx || !canvas) return;
  
  // Draw grid lines
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  // Draw vertical lines
  for (let col = 0; col <= BOARD_COLS; col++) {
    const x = gameState.boardOffsetX + col * gameState.cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, gameState.boardOffsetY);
    ctx.lineTo(x, gameState.boardOffsetY + BOARD_ROWS * gameState.cellHeight);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let row = 0; row <= BOARD_ROWS; row++) {
    const y = gameState.boardOffsetY + row * gameState.cellHeight;
    ctx.beginPath();
    ctx.moveTo(gameState.boardOffsetX, y);
    ctx.lineTo(gameState.boardOffsetX + BOARD_COLS * gameState.cellWidth, y);
    ctx.stroke();
  }
  
  // Draw cell backgrounds
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const x = gameState.boardOffsetX + col * gameState.cellWidth;
      const y = gameState.boardOffsetY + row * gameState.cellHeight;
      
      // Different background colors for each team's side
      const unit = gameState.board[row][col];
      if (unit) {
        ctx.fillStyle = unit.team === 1 ? '#e8f4f8' : '#f8e8e8';
      } else {
        ctx.fillStyle = '#f5f5f5';
      }
      ctx.fillRect(x + 1, y + 1, gameState.cellWidth - 2, gameState.cellHeight - 2);
    }
  }
}

// Draw units on the board
function drawUnits() {
  if (!ctx) return;
  
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const unit = gameState.board[row][col];
      if (!unit || !unit.isAlive) continue;
      
      // Calculate center position of the cell
      const centerX = gameState.boardOffsetX + col * gameState.cellWidth + gameState.cellWidth / 2;
      const centerY = gameState.boardOffsetY + row * gameState.cellHeight + gameState.cellHeight / 2;
      
      // Draw unit circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, UNIT_RADIUS, 0, 2 * Math.PI);
      
      // Different colors for each team, with opacity based on health
      const healthPercent = getHealthPercentage(unit);
      const alpha = Math.max(0.3, healthPercent); // Minimum 30% opacity
      
      if (unit.team === 1) {
        ctx.fillStyle = `rgba(74, 144, 226, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(226, 74, 74, ${alpha})`;
      }
      ctx.fill();
      
      // Draw unit border
      ctx.strokeStyle = unit.team === 1 ? '#2c5282' : '#c53030';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw health bar
      const barWidth = 60;
      const barHeight = 6;
      const barX = centerX - barWidth / 2;
      const barY = centerY - UNIT_RADIUS - 15;
      
      // Background of health bar
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Health bar fill
      const healthWidth = barWidth * healthPercent;
      if (healthPercent > 0.6) {
        ctx.fillStyle = '#4ade80'; // Green
      } else if (healthPercent > 0.3) {
        ctx.fillStyle = '#fbbf24'; // Yellow
      } else {
        ctx.fillStyle = '#ef4444'; // Red
      }
      ctx.fillRect(barX, barY, healthWidth, barHeight);
      
      // Draw ATT value
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`ATT:${unit.att}`, centerX, centerY - 5);
      
      // Draw LIF value
      ctx.fillText(`LIF:${unit.lif}`, centerX, centerY + 8);
    }
  }
}

// Draw game UI
function drawUI() {
  if (!ctx || !canvas) return;
  
  // Draw title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Fighting Game', canvas.width / 2, 50);
  
  // Draw team labels
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#4a90e2';
  ctx.textAlign = 'center';
  ctx.fillText('Team 1', gameState.boardOffsetX + gameState.cellWidth, gameState.boardOffsetY - 30);
  
  ctx.fillStyle = '#e24a4a';
  ctx.fillText('Team 2', gameState.boardOffsetX + 3 * gameState.cellWidth, gameState.boardOffsetY - 30);
  
  // Draw unit stats legend
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  const legendY = gameState.boardOffsetY + BOARD_ROWS * gameState.cellHeight + 40;
  ctx.fillText('ATT: Attack Damage', 20, legendY);
  ctx.fillText('LIF: Life Points (Health)', 20, legendY + 25);
}

// Count alive units for each team
function countAliveUnits(): { team1: number; team2: number } {
  let team1Count = 0;
  let team2Count = 0;
  
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const unit = gameState.board[row][col];
      if (unit && unit.isAlive) {
        if (unit.team === 1) team1Count++;
        else team2Count++;
      }
    }
  }
  
  return { team1: team1Count, team2: team2Count };
}

// Resize canvas to fit window
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  calculateBoardLayout();
}


// Initialize game
function init() {
  if (!canvas || !ctx) {
    console.error('Could not initialize game: Canvas or context is not available');
    return;
  }

  // Initialize game state
  gameState = {
    board: initializeBoard(),
    cellWidth: CELL_SIZE,
    cellHeight: CELL_SIZE,
    boardOffsetX: 0,
    boardOffsetY: 0
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp: number) {
  if (!canvas || !ctx) return;

  // Calculate delta time
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  // Clear canvas
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw game elements
  drawBoard();
  drawUnits();
  drawUI();

  // Continue the loop
  requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);
