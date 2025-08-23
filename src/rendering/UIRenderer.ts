import type { GameState, GameConfig } from "../types/GameTypes.js";
import { GameStatus } from "../types/GameTypes.js";
import { ButtonManager } from "../utils/ButtonManager.js";
import { appEventBus } from "../utils/EventBus.js";

export class UIRenderer {
  private config: GameConfig;
  private buttonManager: ButtonManager;

  constructor(config: GameConfig) {
    this.config = config;
    this.buttonManager = new ButtonManager();
  }

  public drawUI(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    gameStatus: GameStatus,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    switch (gameStatus) {
      case GameStatus.MENU:
        this.drawMenuScreen(ctx, canvasWidth, canvasHeight);
        break;
      case GameStatus.PLAYING:
        this.drawGameUI(ctx, gameState, canvasWidth);
        break;
      case GameStatus.PAUSED:
        this.drawGameUI(ctx, gameState, canvasWidth);
        this.drawPauseOverlay(ctx, canvasWidth, canvasHeight);
        break;
      case GameStatus.GAME_OVER:
        this.drawGameUI(ctx, gameState, canvasWidth);
        this.drawGameOverScreen(ctx, canvasWidth, canvasHeight);
        break;
    }
  }

  private drawMenuScreen(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    // Clear any existing buttons
    this.buttonManager.clearButtons();

    // Draw title
    ctx.fillStyle = "#333";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Fighting Game", canvasWidth / 2, canvasHeight / 2 - 100);

    // Draw subtitle
    ctx.font = "24px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText(
      "Turn-based tactical combat",
      canvasWidth / 2,
      canvasHeight / 2 - 50,
    );

    // Create start button
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = canvasWidth / 2 - buttonWidth / 2;
    const buttonY = canvasHeight / 2 + 20;

    const startButton = this.buttonManager.createButton(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      "Start Game",
      () => this.onStartGame(),
    );

    // Draw the start button
    this.buttonManager.drawButton(ctx, startButton);

    // Draw instructions
    ctx.font = "16px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText(
      "Each unit has ATT (attack) and LIF (life) stats",
      canvasWidth / 2,
      canvasHeight / 2 + 120,
    );
    ctx.fillText(
      "Team 1 (blue) vs Team 2 (red)",
      canvasWidth / 2,
      canvasHeight / 2 + 145,
    );
  }

  private drawGameUI(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    canvasWidth: number,
  ): void {
    this.drawTitle(ctx, canvasWidth);
    this.drawTeamLabels(ctx, gameState);
    this.drawLegend(ctx, gameState);
    this.drawTurnIndicator(ctx, gameState, canvasWidth);
  }

  private drawPauseOverlay(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Pause text
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvasWidth / 2, canvasHeight / 2);
  }

  private drawGameOverScreen(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Game over text
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2 - 50);

    ctx.font = "24px Arial";
    ctx.fillText(
      "Press R to return to menu",
      canvasWidth / 2,
      canvasHeight / 2 + 20,
    );
  }

  private drawTitle(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
    ctx.fillStyle = "#333";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Fighting Game", canvasWidth / 2, 50);
  }

  private drawTeamLabels(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
  ): void {
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle = "#4a90e2";
    ctx.fillText(
      "Team 1",
      gameState.boardOffsetX + gameState.cellWidth,
      gameState.boardOffsetY - 30,
    );

    ctx.fillStyle = "#e24a4a";
    ctx.fillText(
      "Team 2",
      gameState.boardOffsetX + 3 * gameState.cellWidth,
      gameState.boardOffsetY - 30,
    );
  }

  private drawLegend(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
  ): void {
    ctx.fillStyle = "#666";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    const legendY =
      gameState.boardOffsetY +
      this.config.BOARD_ROWS * gameState.cellHeight +
      40;
    ctx.fillText("ATT: Attack Damage", 20, legendY);
    ctx.fillText("LIF: Life Points (Health)", 20, legendY + 25);
  }

  private drawTurnIndicator(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    canvasWidth: number,
  ): void {
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = gameState.currentTurn === 1 ? "#4a90e2" : "#e24a4a";
    ctx.fillText(`Team ${gameState.currentTurn}'s Turn`, canvasWidth / 2, 90);
  }

  private onStartGame(): void {
    // Emit start via the app event bus (decoupled from window)
    appEventBus.emit("startGame", undefined as any);
  }

  public getButtonManager(): ButtonManager {
    return this.buttonManager;
  }
}
