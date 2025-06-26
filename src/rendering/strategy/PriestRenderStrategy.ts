import type { Unit, GameConfig } from "../../types/GameTypes.js";
import type {
  UnitRenderStrategy,
  UnitVisualConfig,
} from "./UnitRenderStrategy.js";

export class PriestRenderStrategy implements UnitRenderStrategy {
  public getVisualConfig(): UnitVisualConfig {
    return {
      team1Color: "34, 197, 94", // Green
      team2Color: "249, 115, 22", // Orange
      symbol: "✚",
    };
  }

  public drawUnitShape(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
    config: GameConfig,
  ): void {
    // Draw diamond shape for priest
    const radius = config.UNIT_RADIUS;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius); // Top
    ctx.lineTo(centerX + radius, centerY); // Right
    ctx.lineTo(centerX, centerY + radius); // Bottom
    ctx.lineTo(centerX - radius, centerY); // Left
    ctx.closePath();

    const visualConfig = this.getVisualConfig();
    const baseColor =
      unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

    let alpha = Math.max(0.3, unit.lif / unit.maxLif);
    if (unit.hasActed) alpha *= 0.5;

    ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
    ctx.fill();

    ctx.strokeStyle = unit.team === 1 ? "#2c5282" : "#c53030";
    ctx.lineWidth = unit.isSelected ? 5 : 3;
    ctx.stroke();
  }

  public drawSpecialEffects(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
    config: GameConfig,
  ): void {
    // Draw healing aura for priest
    if (unit.isSelected) {
      const time = Date.now() / 1000;
      const pulseRadius = config.UNIT_RADIUS + 15 + Math.sin(time * 6) * 8;

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 6) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw cross symbol
      const crossSize = config.UNIT_RADIUS * 0.6;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 3;

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(centerX - crossSize * 0.7, centerY);
      ctx.lineTo(centerX + crossSize * 0.7, centerY);
      ctx.stroke();

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - crossSize);
      ctx.lineTo(centerX, centerY + crossSize);
      ctx.stroke();
    }
  }

  public getUnitTypeName(): string {
    return "Priest";
  }
}
