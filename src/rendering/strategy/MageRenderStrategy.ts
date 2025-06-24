import type { Unit, GameConfig } from '../../types/GameTypes.js';
import type { UnitRenderStrategy, UnitVisualConfig } from './UnitRenderStrategy.js';

export class MageRenderStrategy implements UnitRenderStrategy {
    public getVisualConfig(): UnitVisualConfig {
        return {
            team1Color: '147, 51, 234',  // Purple
            team2Color: '220, 38, 127',  // Pink
            symbol: '🔥'
        };
    }

    public drawUnitShape(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void {
        // Draw hexagon shape for mage
        const sides = 6;
        const radius = config.UNIT_RADIUS;

        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

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
        // Draw magical particles around mage
        if (!unit.hasActed) {
            const time = Date.now() / 1000;
            const particleCount = 8;

            for (let i = 0; i < particleCount; i++) {
                const angle = (i * 2 * Math.PI) / particleCount + time;
                const distance = config.UNIT_RADIUS + 10 + Math.sin(time * 3 + i) * 5;
                const x = centerX + distance * Math.cos(angle);
                const y = centerY + distance * Math.sin(angle);

                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 4 + i) * 0.3})`;
                ctx.fill();
            }
        }
    }

    public getUnitTypeName(): string {
        return 'Mage';
    }
}