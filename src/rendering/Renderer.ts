import type { GameState, GameConfig } from '../types/GameTypes.js';
import { BoardRenderer } from './BoardRenderer.js';
import { UnitRenderer } from './UnitRenderer.js';
import { UIRenderer } from './UIRenderer.js';
import { UnitManager } from '../game/Unit.js';

export class Renderer {
    private boardRenderer: BoardRenderer;
    private unitRenderer: UnitRenderer;
    private uiRenderer: UIRenderer;

    constructor(config: GameConfig, unitManager: UnitManager) {
        this.boardRenderer = new BoardRenderer(config);
        this.unitRenderer = new UnitRenderer(config, unitManager);
        this.uiRenderer = new UIRenderer(config);
    }

    public render(ctx: CanvasRenderingContext2D, gameState: GameState, canvasWidth: number, canvasHeight: number): void {
        // Only draw board and units when playing
        if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused' || gameState.gameStatus === 'game_over') {
            // Draw board first (includes target highlights)
            this.boardRenderer.drawBoard(ctx, gameState);
            // Then draw units on top
            this.unitRenderer.drawUnits(ctx, gameState);
        }

        // Always draw UI (handles different states internally)
        this.uiRenderer.drawUI(ctx, gameState, canvasWidth, canvasHeight);
    }

    public getUIRenderer(): UIRenderer {
        return this.uiRenderer;
    }
}