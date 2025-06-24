import type { GameState, GameConfig } from '../types/GameTypes.js';

export class BoardRenderer {
    private config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public drawBoard(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        this.drawGrid(ctx, gameState);
        this.drawCellBackgrounds(ctx, gameState);
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        // Draw vertical lines
        for (let col = 0; col <= this.config.BOARD_COLS; col++) {
            const x = gameState.boardOffsetX + col * gameState.cellWidth;
            ctx.beginPath();
            ctx.moveTo(x, gameState.boardOffsetY);
            ctx.lineTo(x, gameState.boardOffsetY + this.config.BOARD_ROWS * gameState.cellHeight);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let row = 0; row <= this.config.BOARD_ROWS; row++) {
            const y = gameState.boardOffsetY + row * gameState.cellHeight;
            ctx.beginPath();
            ctx.moveTo(gameState.boardOffsetX, y);
            ctx.lineTo(gameState.boardOffsetX + this.config.BOARD_COLS * gameState.cellWidth, y);
            ctx.stroke();
        }
    }

    private drawCellBackgrounds(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        for (let row = 0; row < this.config.BOARD_ROWS; row++) {
            for (let col = 0; col < this.config.BOARD_COLS; col++) {
                const x = gameState.boardOffsetX + col * gameState.cellWidth;
                const y = gameState.boardOffsetY + row * gameState.cellHeight;

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
}