import type { Unit, GameConfig } from "../../types/GameTypes.js";
import { BaseRenderStrategy } from "./BaseRenderStrategy.js";

export class PriestRenderStrategy extends BaseRenderStrategy {
  constructor() {
    super("priest");
  }

  public drawSpecialEffects(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
    config: GameConfig,
  ): void {
    const visualConfig = this.getVisualConfig();

    // Draw healing aura
    if (unit.isSelected || !unit.hasActed) {
      const auraColor =
        visualConfig.specialEffects?.auraColor || "rgba(34, 197, 94, 0.4)";

      ctx.beginPath();
      ctx.arc(centerX, centerY, config.UNIT_RADIUS * 1.4, 0, 2 * Math.PI);
      ctx.fillStyle = auraColor;
      ctx.fill();
    }

    // Draw holy particles when selected
    if (unit.isSelected) {
      this.drawHolyParticles(ctx, centerX, centerY, config, visualConfig);
    }
  }

  private drawHolyParticles(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    config: GameConfig,
    visualConfig: any,
  ): void {
    const particleCount = visualConfig.specialEffects?.particleCount || 8;
    const time = Date.now() * 0.003;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time;
      const radius = config.UNIT_RADIUS * (1.2 + Math.sin(time * 2 + i) * 0.2);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
    }
  }
}
