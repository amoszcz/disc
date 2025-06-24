import type { Unit, GameConfig } from '../../types/GameTypes.js';
import type { UnitRenderStrategy, UnitVisualConfig } from './UnitRenderStrategy.js';

export class KnightRenderStrategy implements UnitRenderStrategy {
    public getVisualConfig(): UnitVisualConfig {
        return {
            team1Color: '139, 69, 19',   // Brown
            team2Color: '75, 85, 99',    // Gray
            symbol: '⚔️'
        };
    }

    public drawUnitShape(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void {
        // Draw a square/shield shape
        const size = config.UNIT_RADIUS;

        const visualConfig = this.getVisualConfig();
        const baseColor = unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

        let alpha = Math.max(0.3, unit.lif / unit.maxLif);
        if (unit.hasActed) alpha *= 0.5;

        ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
        ctx.fillRect(centerX - size, centerY - size, size * 2, size * 2);

        ctx.strokeStyle = unit.team === 1 ? '#2c5282' : '#c53030';
        ctx.lineWidth = unit.isSelected ? 5 : 3;
        ctx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
    }

    public drawSpecialEffects(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void {
        const time = Date.now() / 1000;

        // 1. Armor Plating Effect - Draw metallic gleam lines
        if (!unit.hasActed) {
            this.drawArmorGleam(ctx, centerX, centerY, config, time);
        }

        // 2. Shield Wall Effect - When selected, show defensive aura
        if (unit.isSelected) {
            this.drawShieldAura(ctx, centerX, centerY, config, time);
        }

        // 3. Battle Readiness - Sword gleam for active knights
        if (unit.team === 1 && !unit.hasActed && !unit.isSelected) { // Assuming current turn checking is done elsewhere
            this.drawSwordGleam(ctx, centerX, centerY, config, time);
        }

        // 4. Damage Cracks - Show battle damage on low health
        const healthPercent = unit.lif / unit.maxLif;
        if (healthPercent < 0.5) {
            this.drawBattleDamage(ctx, centerX, centerY, config, healthPercent);
        }
    }

    private drawArmorGleam(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: GameConfig, time: number): void {
        // Animated metallic gleam across the armor
        const gleamOffset = Math.sin(time * 2) * config.UNIT_RADIUS * 0.8;

        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(time * 3) * 0.2;

        // Create gradient for metallic effect
        const gradient = ctx.createLinearGradient(
            centerX - config.UNIT_RADIUS + gleamOffset,
            centerY - config.UNIT_RADIUS,
            centerX + config.UNIT_RADIUS + gleamOffset,
            centerY + config.UNIT_RADIUS
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(
            centerX - config.UNIT_RADIUS,
            centerY - config.UNIT_RADIUS,
            config.UNIT_RADIUS * 2,
            config.UNIT_RADIUS * 2
        );

        ctx.restore();
    }

    private drawShieldAura(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: GameConfig, time: number): void {
        // Defensive shield barrier effect
        const pulseRadius = config.UNIT_RADIUS + 12 + Math.sin(time * 4) * 6;

        // Outer defensive ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(135, 206, 235, ${0.6 + Math.sin(time * 5) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner protective barrier
        ctx.beginPath();
        ctx.arc(centerX, centerY, config.UNIT_RADIUS + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(time * 6) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw shield symbols at cardinal directions
        const shieldDistance = config.UNIT_RADIUS + 15;
        const directions = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];

        directions.forEach((angle, index) => {
            const x = centerX + Math.cos(angle + time) * shieldDistance;
            const y = centerY + Math.sin(angle + time) * shieldDistance;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + time * 2);

            // Draw small shield symbol
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(time * 8 + index) * 0.3})`;
            ctx.fillRect(-3, -4, 6, 8);
            ctx.beginPath();
            ctx.arc(0, -4, 3, 0, Math.PI);
            ctx.fill();

            ctx.restore();
        });
    }

    private drawSwordGleam(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: GameConfig, time: number): void {
        // Subtle sword gleam to show readiness to attack
        const gleamAngle = time * 0.5;
        const gleamLength = config.UNIT_RADIUS * 0.6;

        ctx.save();
        ctx.translate(centerX + config.UNIT_RADIUS * 0.7, centerY - config.UNIT_RADIUS * 0.7);
        ctx.rotate(gleamAngle);

        // Draw sword gleam line
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 8) * 0.4})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-gleamLength / 2, 0);
        ctx.lineTo(gleamLength / 2, 0);
        ctx.stroke();

        // Add sparkle effect
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 12) * 0.2})`;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    private drawBattleDamage(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, config: GameConfig, healthPercent: number): void {
        // Draw cracks and battle damage on low health
        const damageIntensity = 1 - healthPercent;
        const numCracks = Math.floor(damageIntensity * 4) + 1;

        ctx.save();
        ctx.strokeStyle = `rgba(139, 0, 0, ${damageIntensity * 0.8})`;
        ctx.lineWidth = 1 + damageIntensity;
        ctx.lineCap = 'round';

        for (let i = 0; i < numCracks; i++) {
            const angle = (i / numCracks) * Math.PI * 2;
            const startRadius = config.UNIT_RADIUS * 0.3;
            const endRadius = config.UNIT_RADIUS * 0.9;

            const startX = centerX + Math.cos(angle) * startRadius;
            const startY = centerY + Math.sin(angle) * startRadius;
            const endX = centerX + Math.cos(angle) * endRadius;
            const endY = centerY + Math.sin(angle) * endRadius;

            // Add some randomness to crack paths
            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 10;
            const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 10;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.stroke();
        }

        // Add some dents/scratches
        if (healthPercent < 0.3) {
            ctx.fillStyle = `rgba(0, 0, 0, ${damageIntensity * 0.3})`;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * config.UNIT_RADIUS * 0.6;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;

                ctx.beginPath();
                ctx.arc(x, y, 2 * damageIntensity, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    public getUnitTypeName(): string {
        return 'Knight';
    }
}