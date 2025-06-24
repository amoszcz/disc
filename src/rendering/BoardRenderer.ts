import type { GameState, GameConfig, BoardPosition } from '../types/GameTypes.js';

export class BoardRenderer {
    private config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public drawBoard(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        this.drawGrid(ctx, gameState);
        this.drawCellBackgrounds(ctx, gameState);
        this.drawTargetHighlights(ctx, gameState);
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

    private drawTargetHighlights(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        if (!gameState.selectedUnit || gameState.availableTargets.length === 0) {
            return;
        }

        const time = Date.now() / 1000;

        gameState.availableTargets.forEach((target: BoardPosition) => {
            const x = gameState.boardOffsetX + target.col * gameState.cellWidth;
            const y = gameState.boardOffsetY + target.row * gameState.cellHeight;

            const targetUnit = gameState.board[target.row][target.col];

            // Different highlighting for different target types
            if (targetUnit) {
                if (targetUnit.team === gameState.selectedUnit!.team) {
                    // Friendly unit (for healing) - green highlight
                    this.drawTargetHighlight(ctx, x, y, gameState.cellWidth, gameState.cellHeight,
                        'rgba(34, 197, 94, 0.4)', '#22c55e', time);
                } else {
                    // Enemy unit - red highlight
                    this.drawTargetHighlight(ctx, x, y, gameState.cellWidth, gameState.cellHeight,
                        'rgba(239, 68, 68, 0.4)', '#ef4444', time);
                }
            } else {
                // Empty cell (for abilities) - blue highlight
                this.drawTargetHighlight(ctx, x, y, gameState.cellWidth, gameState.cellHeight,
                    'rgba(59, 130, 246, 0.4)', '#3b82f6', time);
            }
        });
    }

    private drawTargetHighlight(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number,
                                fillColor: string, strokeColor: string, time: number): void {
        // Pulsing fill
        const pulseAlpha = 0.3 + Math.sin(time * 4) * 0.2;
        const adjustedFillColor = fillColor.replace(/0\.\d+/, pulseAlpha.toFixed(2));

        ctx.fillStyle = adjustedFillColor;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

        // Animated border
        const borderWidth = 3 + Math.sin(time * 6) * 1;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

        // Corner indicators
        const cornerSize = 8;
        ctx.fillStyle = strokeColor;

        // Top-left corner
        ctx.fillRect(x + 2, y + 2, cornerSize, 2);
        ctx.fillRect(x + 2, y + 2, 2, cornerSize);

        // Top-right corner
        ctx.fillRect(x + width - cornerSize - 2, y + 2, cornerSize, 2);
        ctx.fillRect(x + width - 4, y + 2, 2, cornerSize);

        // Bottom-left corner
        ctx.fillRect(x + 2, y + height - 4, cornerSize, 2);
        ctx.fillRect(x + 2, y + height - cornerSize - 2, 2, cornerSize);

        // Bottom-right corner
        ctx.fillRect(x + width - cornerSize - 2, y + height - 4, cornerSize, 2);
        ctx.fillRect(x + width - 4, y + height - cornerSize - 2, 2, cornerSize);
    }
}