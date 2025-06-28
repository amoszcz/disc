import type { Unit, GameConfig } from "../../types/GameTypes.js";
import { BaseRenderStrategy } from "./BaseRenderStrategy.js";

export class ArcherRenderStrategy extends BaseRenderStrategy {
  constructor() {
    super("archer");
  }

  public drawSpecialEffects(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
    config: GameConfig,
  ): void {
    // Draw crosshair for archer precision
    if (unit.isSelected) {
      const visualConfig = this.getVisualConfig();
      const crosshairColor =
        visualConfig.specialEffects?.crosshairColor ||
        "rgba(255, 255, 255, 0.8)";

      ctx.strokeStyle = crosshairColor;
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
}
