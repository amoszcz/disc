import type { GameConfig } from './types/GameTypes.js';
import { CanvasManager } from './utils/Canvas.js';
import { GameStateManager } from './game/GameState.js';
import { Renderer } from './rendering/Renderer.js';

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
  private attackMessage: string = '';
  private attackMessageTime: number = 0;

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

    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resizeCanvas());

    window.addEventListener('startGame', () => {
      this.gameStateManager.startGame();
    });

    if (this.canvasManager.canvas) {
      this.canvasManager.canvas.addEventListener('mousemove', (event) => {
        this.handleMouseMove(event);
      });

      this.canvasManager.canvas.addEventListener('click', (event) => {
        this.handleMouseClick(event);
      });
    }

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

    const buttonManager = this.renderer.getUIRenderer().getButtonManager();
    const buttonClicked = buttonManager.handleMouseClick(mouseX, mouseY);

    if (!buttonClicked && this.gameStateManager.gameState.gameStatus === 'playing') {
      this.handleUnitSelection(mouseX, mouseY);
    }
  }

  private handleUnitSelection(mouseX: number, mouseY: number): void {
    const boardPos = this.gameStateManager.getBoardPositionFromPixels(mouseX, mouseY);

    if (boardPos) {
      const unit = this.gameStateManager.getUnitAt(boardPos.row, boardPos.col);

      if (unit) {
        // If we have a selected unit and clicked on a different unit, try to attack
        if (this.gameStateManager.gameState.selectedUnit &&
            this.gameStateManager.gameState.selectedUnit !== unit) {

          const attackResult = this.gameStateManager.attemptAttack(boardPos.row, boardPos.col);
          if (attackResult && attackResult.success) {
            this.showAttackMessage(attackResult.message);
          } else if (attackResult && !attackResult.success) {
            this.showAttackMessage(attackResult.message);
          } else {
            // Try to select the clicked unit instead
            const wasSelected = this.gameStateManager.selectUnit(boardPos.row, boardPos.col);
            if (!wasSelected) {
              this.gameStateManager.deselectAllUnits();
            }
          }
        } else {
          // Try to select the clicked unit
          const wasSelected = this.gameStateManager.selectUnit(boardPos.row, boardPos.col);
          if (!wasSelected) {
            this.gameStateManager.deselectAllUnits();
          }
        }
      } else {
        // Clicked on empty cell
        this.gameStateManager.deselectAllUnits();
      }
    } else {
      // Click outside board
      this.gameStateManager.deselectAllUnits();
    }
  }

  private showAttackMessage(message: string): void {
    this.attackMessage = message;
    this.attackMessageTime = Date.now();
  }

  private drawAttackMessage(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    if (this.attackMessage && Date.now() - this.attackMessageTime < 3000) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.attackMessage, canvasWidth / 2, 150);
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
      case ' ':
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

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.canvasManager.clearCanvas();

    this.renderer.render(
        this.canvasManager.ctx,
        this.gameStateManager.gameState,
        this.canvasManager.canvas.width,
        this.canvasManager.canvas.height
    );

    // Draw attack messages
    this.drawAttackMessage(this.canvasManager.ctx, this.canvasManager.canvas.width);

    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
}

window.addEventListener('load', () => {
  const game = new Game();
  game.init();
});