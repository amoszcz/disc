import type { GameConfig } from './types/GameTypes.js';
import { Game } from './core/Game.js';

// Game configuration
const CONFIG: GameConfig = {
  BOARD_ROWS: 3,
  BOARD_COLS: 4,
  CELL_SIZE: 120,
  UNIT_RADIUS: 35,
  DEFAULT_ATT: 25,
  DEFAULT_LIF: 100
};

// Initialize and start the game when page loads
window.addEventListener('load', () => {
  try {
    const game = new Game(CONFIG, 'game');
    const initialized = game.init();

    if (!initialized) {
      console.error('Failed to initialize the game');
    }
  } catch (error) {
    console.error('Error starting the game:', error);
  }
});