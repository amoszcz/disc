import type { CanvasManager } from "../utils/Canvas.js";
import type { GameStateManager } from "../game/GameState.js";
import type { Renderer } from "../rendering/Renderer.js";
import type { InputManager } from "../input/InputManager.js";

export class GameLoop {
  private canvasManager: CanvasManager;
  private gameStateManager: GameStateManager;
  private renderer: Renderer;
  private inputManager: InputManager;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor(
    canvasManager: CanvasManager,
    gameStateManager: GameStateManager,
    renderer: Renderer,
    inputManager: InputManager,
  ) {
    this.canvasManager = canvasManager;
    this.gameStateManager = gameStateManager;
    this.renderer = renderer;
    this.inputManager = inputManager;
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  public stop(): void {
    this.isRunning = false;
  }

  private loop(timestamp: number): void {
    if (
      !this.isRunning ||
      !this.canvasManager.ctx ||
      !this.canvasManager.canvas
    ) {
      return;
    }

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
      this.canvasManager.canvas.height,
    );

    // Draw UI overlays
    this.inputManager.drawAttackMessage(
      this.canvasManager.ctx,
      this.canvasManager.canvas.width,
    );

    // Continue the loop
    if (this.isRunning) {
      requestAnimationFrame((timestamp) => this.loop(timestamp));
    }
  }
}
