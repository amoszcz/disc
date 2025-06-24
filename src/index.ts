import type { GameConfig } from './types/GameTypes.js';
import { CanvasManager } from './utils/Canvas.js';
import { GameStateManager } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';

// Game configuration
const CONFIG: GameConfig = {
  BOARD_ROWS: 3,
  BOARD_COLS: 4,
  CELL_SIZE: 120,
  UNIT_RADIUS: 35,
  DEFAULT_ATT: 25,
  DEFAULT_LIF: 100
};

class Game {
  private canvasManager: CanvasManager;
  private gameStateManager: GameStateManager;
  private renderer: Renderer;
  private lastTime: number = 0;

  constructor() {
    this.canvasManager = new CanvasManager('game');
    this.gameStateManager = new GameStateManager(CONFIG);
    this.renderer = new Renderer(CONFIG, this.gameStateManager.getBoardManager().getUnitManager());
  }

  public init(): void {
    if (!this.canvasManager.isValid()) {
      console.error('Could not initialize game: Canvas or context is not available');
      return;
    }

    this.resizeCanvas();
    this.setupEventListeners();

    // Start game loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Listen for start game event
    window.addEventListener('startGame', () => {
      this.gameStateManager.startGame();
    });

    // Mouse events for button interactions and unit selection
    if (this.canvasManager.canvas) {
      this.canvasManager.canvas.addEventListener('mousemove', (event) => {
        this.handleMouseMove(event);
      });

      this.canvasManager.canvas.addEventListener('click', (event) => {
        this.handleMouseClick(event);
      });
    }

    // Keyboard events
    window.addEventListener('keydown', (event) => {
      this.handleKeyDown(event);
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.canvasManager.canvas) return;

    const rect = this.canvasManager.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonManager = this.renderer.getUIRenderer().getButtonManager();
    buttonManager.handleMouseMove(mouseX, mouseY);
  }

  private handleMouseClick(event: MouseEvent): void {
    if (!this.canvasManager.canvas) return;

    const rect = this.canvasManager.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // First check if a UI button was clicked
    const buttonManager = this.renderer.getUIRenderer().getButtonManager();
    const buttonClicked = buttonManager.handleMouseClick(mouseX, mouseY);

    // If no button was clicked and we're in playing state, handle unit selection
    if (!buttonClicked && this.gameStateManager.gameState.gameStatus === 'playing') {
      this.handleUnitSelection(mouseX, mouseY);
    }
  }

  private handleUnitSelection(mouseX: number, mouseY: number): void {
    const boardPos = this.gameStateManager.getBoardPositionFromPixels(mouseX, mouseY);

    if (boardPos) {
      // Click was on the board
      const unit = this.gameStateManager.getUnitAt(boardPos.row, boardPos.col);

      if (unit) {
        // Clicked on a unit - try to select it
        const wasSelected = this.gameStateManager.selectUnit(boardPos.row, boardPos.col);

        if (!wasSelected) {
          // Unit couldn't be selected (wrong team or dead), deselect all
          this.gameStateManager.deselectAllUnits();
        }
      } else {
        // Clicked on empty cell, deselect all units
        this.gameStateManager.deselectAllUnits();
      }
    } else {
      // Click was outside the board, deselect all units
      this.gameStateManager.deselectAllUnits();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key.toLowerCase()) {
      case 'r':
        if (this.gameStateManager.gameState.gameStatus === 'game_over') {
          this.gameStateManager.returnToMenu();
        }
        break;
      case 'escape':
        if (this.gameStateManager.gameState.gameStatus === 'playing') {
          this.gameStateManager.pauseGame();
        } else if (this.gameStateManager.gameState.gameStatus === 'paused') {
          this.gameStateManager.resumeGame();
        }
        break;
      case ' ': // Spacebar to switch turns (for testing)
        if (this.gameStateManager.gameState.gameStatus === 'playing') {
          this.gameStateManager.switchTurn();
        }
        break;
    }
  }

  private resizeCanvas(): void {
    this.canvasManager.resizeCanvas();
    if (this.canvasManager.canvas) {
      this.gameStateManager.calculateBoardLayout(
          this.canvasManager.canvas.width,
          this.canvasManager.canvas.height
      );
    }
  }

  private gameLoop(timestamp: number): void {
    if (!this.canvasManager.ctx || !this.canvasManager.canvas) return;

    // Calculate delta time
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Clear canvas
    this.canvasManager.clearCanvas();

    // Render game
    this.renderer.render(
        this.canvasManager.ctx,
        this.gameStateManager.gameState,
        this.canvasManager.canvas.width,
        this.canvasManager.canvas.height
    );

    // Continue the loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
}

// Start the game when page loads
window.addEventListener('load', () => {
  const game = new Game();
  game.init();
});