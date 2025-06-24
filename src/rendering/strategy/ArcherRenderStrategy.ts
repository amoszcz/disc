import type { Unit, GameConfig } from '../../types/GameTypes.js';
import type { UnitRenderStrategy, UnitVisualConfig } from './UnitRenderStrategy.js';

export class ArcherRenderStrategy implements UnitRenderStrategy {
    public getVisualConfig(): UnitVisualConfig {
        return {
            team1Color: '74, 144, 226',  // Blue
            team2Color: '226, 74, 74',   // Red
            symbol: '🏹'
        };
    }

    public drawUnitShape(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void {
        // Draw standard circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, config.UNIT_RADIUS, 0, 2 * Math.PI);

        const visualConfig = this.getVisualConfig();
        const baseColor = unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

        let alpha = Math.max(0.3, unit.lif / unit.maxLif);
        if (unit.hasActed) alpha *= 0.5;

        ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
        ctx.fill();

        ctx.strokeStyle = unit.team === 1 ? '#2c5282' : '#c53030';
        ctx.lineWidth = unit.isSelected ? 5 : 3;
        ctx.stroke();
    }

    public drawSpecialEffects(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void {
        // Draw crosshair for archer precision
        if (unit.isSelected) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;

            const crossSize = config.UNIT_RADIUS * 0.4;

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(centerX - crossSize, centerY);
            ctx.lineTo(centerX + crossSize, centerY);
            ctx.stroke();

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - crossSize);
            ctx.lineTo(centerX, centerY + crossSize);
            ctx.stroke();
        }
    }

    public getUnitTypeName(): string {
        return 'Archer';
    }
}