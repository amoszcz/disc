import { GameConfig, GameStatus } from "../types/GameTypes.js";
import { CanvasManager } from "../utils/Canvas.js";
import { GameStateManager } from "../game/GameState.js";
import { Renderer } from "../rendering/Renderer.js";
import { InputManager } from "../input/InputManager.js";
import { GameLoop } from "./GameLoop.js";
import { AssetManager } from "../utils/AssetManager.js";

export class Game {
  private readonly canvasManager: CanvasManager;
  private readonly gameStateManager: GameStateManager;
  private readonly renderer: Renderer;
  private readonly inputManager: InputManager;
  private readonly gameLoop: GameLoop;
  private readonly config: GameConfig;

  public onGameEvent?: (event: any) => void;
  public onGameEnd?: () => void;

  constructor(
    config: GameConfig,
    canvasId: string | HTMLCanvasElement = "game",
  ) {
    this.config = config;

    // Handle both string ID and direct canvas element
    if (typeof canvasId === "string") {
      this.canvasManager = new CanvasManager(canvasId);
    } else {
      // Create a CanvasManager that works with existing canvas
      this.canvasManager = new CanvasManager(canvasId.id || "game");
    }

    this.gameStateManager = new GameStateManager(config);
    this.renderer = new Renderer(
      config,
      this.gameStateManager.getBoardManager().getUnitManager(),
    );

    // React to game status changes to notify end-of-game instantly
    this.gameStateManager.addOnGameStatusChanged((status) => {
      if (status === GameStatus.GAME_OVER) {
        if (this.onGameEnd) {
          this.onGameEnd();
        }
      }
    });

    if (!this.canvasManager.canvas) {
      throw new Error("Could not initialize canvas");
    }

    this.inputManager = new InputManager(
      this.canvasManager.canvas,
      this.gameStateManager,
      this.renderer,
    );

    this.gameLoop = new GameLoop(
      this.canvasManager,
      this.gameStateManager,
      this.renderer,
      this.inputManager,
    );
  }

  public async init() {
    if (!this.canvasManager.isValid()) {
      console.error(
        "Could not initialize game: Canvas or context is not available",
      );
      return false;
    }
    await AssetManager.getInstance().initializeAssets();

    this.setupWindowEvents();
    this.resizeCanvas();
    this.gameLoop.start();

    return true;
  }

  private setupWindowEvents(): void {
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    this.canvasManager.resizeCanvas();
    if (this.canvasManager.canvas) {
      this.gameStateManager.calculateBoardLayout(
        this.canvasManager.canvas.width,
        this.canvasManager.canvas.height,
      );
    }
  }

  // Expose gameStateManager for external access
  public getGameState(): GameStateManager {
    return this.gameStateManager;
  }

  public startGame(): void {
    this.gameStateManager.gameStatus = GameStatus.PLAYING;
  }

  public pauseGame(): void {
    this.gameStateManager.gameStatus = GameStatus.PAUSED;
  }

  public resumeGame(): void {
    this.gameStateManager.gameStatus = GameStatus.PLAYING;
  }

  public endGame(): void {
    this.gameStateManager.gameStatus = GameStatus.GAME_OVER;
    if (this.onGameEnd) {
      this.onGameEnd();
    }
  }

  public stop(): void {
    this.gameLoop.stop();
  }
}
