
import type { Unit, GameConfig } from '../../types/GameTypes.js';
import { BaseRenderStrategy } from './BaseRenderStrategy.js';

export class MageRenderStrategy extends BaseRenderStrategy {
  constructor() {
    super('mage');
  }

  public drawSpecialEffects(
      ctx: CanvasRenderingContext2D,
      unit: Unit,
      centerX: number,
      centerY: number,
      config: GameConfig,
  ): void {
    const visualConfig = this.getVisualConfig();

    // Draw magical aura
    if (unit.isSelected || !unit.hasActed) {
      const auraColor = visualConfig.specialEffects?.auraColor || "rgba(128, 90, 213, 0.3)";
      const glowIntensity = visualConfig.specialEffects?.glowIntensity || 0.8;

      ctx.beginPath();
      ctx.arc(centerX, centerY, config.UNIT_RADIUS * 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = auraColor;
      ctx.globalAlpha = glowIntensity * (unit.isSelected ? 1 : 0.5);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw spell particles when selected
    if (unit.isSelected) {
      this.drawSpellParticles(ctx, centerX, centerY, config);
    }
  }

  private drawSpellParticles(
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      config: GameConfig,
  ): void {
    const time = Date.now() * 0.005;
    const particleCount = 6;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const radius = config.UNIT_RADIUS * 1.2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fill();
    }
  }
}