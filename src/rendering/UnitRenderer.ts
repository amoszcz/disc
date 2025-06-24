import type { Unit, GameState, GameConfig } from '../types/GameTypes.js';
import { UnitManager } from '../game/Unit.js';

export class UnitRenderer {
    private config: GameConfig;
    private unitManager: UnitManager;

    constructor(config: GameConfig, unitManager: UnitManager) {
        this.config = config;
        this.unitManager = unitManager;
    }

    public drawUnits(ctx: CanvasRenderingContext2D, gameState: GameState): void {
        for (let row = 0; row < this.config.BOARD_ROWS; row++) {
            for (let col = 0; col < this.config.BOARD_COLS; col++) {
                const unit = gameState.board[row][col];
                if (!this.unitManager.isUnitAlive(unit)) continue;

                const centerX = gameState.boardOffsetX + col * gameState.cellWidth + gameState.cellWidth / 2;
                const centerY = gameState.boardOffsetY + row * gameState.cellHeight + gameState.cellHeight / 2;

                this.drawUnit(ctx, unit, centerX, centerY);
                this.drawHealthBar(ctx, unit, centerX, centerY);
                this.drawUnitStats(ctx, unit, centerX, centerY);
            }
        }
    }

    private drawUnit(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number): void {
        // Draw unit circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.config.UNIT_RADIUS, 0, 2 * Math.PI);

        // Different colors for each team, with opacity based on health
        const healthPercent = this.unitManager.getHealthPercentage(unit);
        const alpha = Math.max(0.3, healthPercent);

        if (unit.team === 1) {
            ctx.fillStyle = `rgba(74, 144, 226, ${alpha})`;
        } else {
            ctx.fillStyle = `rgba(226, 74, 74, ${alpha})`;
        }
        ctx.fill();

        // Draw unit border
        ctx.strokeStyle = unit.team === 1 ? '#2c5282' : '#c53030';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    private drawHealthBar(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number): void {
        const barWidth = 60;
        const barHeight = 6;
        const barX = centerX - barWidth / 2;
        const barY = centerY - this.config.UNIT_RADIUS - 15;

        const healthPercent = this.unitManager.getHealthPercentage(unit);

        // Background of health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health bar fill
        const healthWidth = barWidth * healthPercent;
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#4ade80'; // Green
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#fbbf24'; // Yellow
        } else {
            ctx.fillStyle = '#ef4444'; // Red
        }
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }

    private drawUnitStats(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number): void {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw ATT value
        ctx.fillText(`ATT:${unit.att}`, centerX, centerY - 5);

        // Draw LIF value
        ctx.fillText(`LIF:${unit.lif}`, centerX, centerY + 8);
    }
}