import type { GameConfig } from '../types/GameTypes.js';
import { CanvasManager } from '../utils/Canvas.js';
import { GameStateManager } from '../game/GameState.js';
import { Renderer } from '../rendering/Renderer.js';
import { InputManager } from '../input/InputManager.js';
import { GameLoop } from './GameLoop.js';

export class Game {
    private readonly canvasManager: CanvasManager;
    private readonly gameStateManager: GameStateManager;
    private readonly renderer: Renderer;
    private readonly inputManager: InputManager;
    private readonly gameLoop: GameLoop;
    private readonly config: GameConfig;

    constructor(config: GameConfig, canvasId: string = 'game') {
        this.config = config;
        this.canvasManager = new CanvasManager(canvasId);
        this.gameStateManager = new GameStateManager(config);
        this.renderer = new Renderer(config, this.gameStateManager.getBoardManager().getUnitManager());

        if (!this.canvasManager.canvas) {
            throw new Error('Could not initialize canvas');
        }

        this.inputManager = new InputManager(
            this.canvasManager.canvas,
            this.gameStateManager,
            this.renderer
        );

        this.gameLoop = new GameLoop(
            this.canvasManager,
            this.gameStateManager,
            this.renderer,
            this.inputManager
        );
    }

    public init(): boolean {
        if (!this.canvasManager.isValid()) {
            console.error('Could not initialize game: Canvas or context is not available');
            return false;
        }

        this.setupWindowEvents();
        this.resizeCanvas();
        this.gameLoop.start();

        return true;
    }

    private setupWindowEvents(): void {
        window.addEventListener('resize', () => this.resizeCanvas());
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

    public destroy(): void {
        this.gameLoop.stop();
        // Additional cleanup if needed
    }

    // Expose some methods for external access if needed
    public getGameState(): GameStateManager {
        return this.gameStateManager;
    }

    public getRenderer(): Renderer {
        return this.renderer;
    }
}