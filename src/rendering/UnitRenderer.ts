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

                if (unit.isSelected) {
                    this.drawSelectionHighlight(ctx, centerX, centerY);
                }

                this.drawUnit(ctx, unit, centerX, centerY, gameState.currentTurn);
                this.drawHealthBar(ctx, unit, centerX, centerY);
                this.drawUnitStats(ctx, unit, centerX, centerY);

                if (unit.hasActed) {
                    this.drawInactiveOverlay(ctx, centerX, centerY);
                }
            }
        }
    }

    private drawSelectionHighlight(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
        const time = Date.now() / 1000;
        const pulseRadius = this.config.UNIT_RADIUS + 8 + Math.sin(time * 4) * 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, this.config.UNIT_RADIUS + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private drawUnit(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, currentTurn: 1 | 2): void {
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.config.UNIT_RADIUS, 0, 2 * Math.PI);

        const healthPercent = this.unitManager.getHealthPercentage(unit);
        let alpha = Math.max(0.3, healthPercent);

        // Dim non-active team units and inactive units
        if (unit.team !== currentTurn) {
            alpha *= 0.7;
        }
        if (unit.hasActed) {
            alpha *= 0.5;
        }

        if (unit.team === 1) {
            ctx.fillStyle = `rgba(74, 144, 226, ${alpha})`;
        } else {
            ctx.fillStyle = `rgba(226, 74, 74, ${alpha})`;
        }
        ctx.fill();

        ctx.strokeStyle = unit.team === 1 ? '#2c5282' : '#c53030';
        ctx.lineWidth = unit.isSelected ? 5 : 3;
        ctx.stroke();

        // Glow for selectable units
        if (unit.team === currentTurn && !unit.isSelected && !unit.hasActed) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.config.UNIT_RADIUS + 2, 0, 2 * Math.PI);
            ctx.strokeStyle = unit.team === 1 ? 'rgba(74, 144, 226, 0.3)' : 'rgba(226, 74, 74, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    private drawInactiveOverlay(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
        // Draw diagonal lines to indicate inactive unit
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 3;

        const offset = this.config.UNIT_RADIUS * 0.7;

        // First diagonal line
        ctx.beginPath();
        ctx.moveTo(centerX - offset, centerY - offset);
        ctx.lineTo(centerX + offset, centerY + offset);
        ctx.stroke();

        // Second diagonal line
        ctx.beginPath();
        ctx.moveTo(centerX - offset, centerY + offset);
        ctx.lineTo(centerX + offset, centerY - offset);
        ctx.stroke();
    }

    private drawHealthBar(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number): void {
        const barWidth = 60;
        const barHeight = 6;
        const barX = centerX - barWidth / 2;
        const barY = centerY - this.config.UNIT_RADIUS - 15;

        const healthPercent = this.unitManager.getHealthPercentage(unit);

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthWidth = barWidth * healthPercent;
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#4ade80';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#fbbf24';
        } else {
            ctx.fillStyle = '#ef4444';
        }
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }

    private drawUnitStats(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number): void {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'black';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.fillText(`ATT:${unit.att}`, centerX, centerY - 5);
        ctx.fillText(`LIF:${unit.lif}`, centerX, centerY + 8);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}