import type { Unit, GameConfig } from '../../types/GameTypes.js';
import { BaseRenderStrategy } from './BaseRenderStrategy.js';

export class KnightRenderStrategy extends BaseRenderStrategy {
  constructor() {
    super('knight');
  }

  public drawSpecialEffects(
      ctx: CanvasRenderingContext2D,
      unit: Unit,
      centerX: number,
      centerY: number,
      config: GameConfig,
  ): void {
    const visualConfig = this.getVisualConfig();

    // Draw armor glow when selected or ready to act
    if (unit.isSelected || !unit.hasActed) {
      const glowIntensity = visualConfig.specialEffects?.glowIntensity || 1.0;
      const baseColor = unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

      ctx.beginPath();
      ctx.arc(centerX, centerY, config.UNIT_RADIUS * 1.3, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${baseColor}, ${0.2 * glowIntensity})`;
      ctx.fill();

      // Draw shield effect
      if (unit.isSelected) {
        this.drawShieldEffect(ctx, centerX, centerY, config);
      }
    }
  }

  private drawShieldEffect(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      config: GameConfig,
  ): void {
    ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, config.UNIT_RADIUS * 1.1, 0, 2 * Math.PI);
    ctx.stroke();
  }
}