import { Unit, GameState, GameConfig, UnitType } from "../types/GameTypes.js";
import { UnitManager } from "../game/Unit.js";
import { UnitRenderStrategyFactory } from "./strategy/UnitRenderStrategyFactory.js";
import { DamageEffectManager } from "./effects/DamageEffectManager.js";

export class UnitRenderer {
  private config: GameConfig;
  private unitManager: UnitManager;
  private effectManager: DamageEffectManager;

  constructor(config: GameConfig, unitManager: UnitManager) {
    this.config = config;
    this.unitManager = unitManager;
    this.effectManager = new DamageEffectManager();
  }

  private addDamageEffect(
    targetUnit: Unit,
    attackerType: UnitType,
    centerX: number,
    centerY: number,
  ): void {
    this.effectManager.addEffect(targetUnit, attackerType, centerX, centerY);
  }

  public drawUnits(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    // Draw all units first
    this.drawAllUnits(ctx, gameState);

    // Draw damage effects on top
    this.effectManager.drawEffects(ctx);
  }

  private drawAllUnits(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
  ): void {
    // Move existing drawUnits logic here
    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = gameState.board[row][col];
        if (!this.unitManager.isUnitAlive(unit)) continue;

        const centerX =
          gameState.boardOffsetX +
          col * gameState.cellWidth +
          gameState.cellWidth / 2;
        const centerY =
          gameState.boardOffsetY +
          row * gameState.cellHeight +
          gameState.cellHeight / 2;

        if (unit.isSelected) {
          this.drawSelectionHighlight(ctx, centerX, centerY);
        }

        this.drawUnit(ctx, unit, centerX, centerY, gameState.currentTurn);
        this.drawHealthBar(ctx, unit, centerX, centerY);
        this.drawUnitStats(ctx, unit, centerX, centerY);
        this.drawUnitTypeSymbol(ctx, unit, centerX, centerY);

        if (unit.hasActed) {
          this.drawInactiveOverlay(ctx, centerX, centerY);
        }
      }
    }
  }

  private drawSelectionHighlight(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    const time = Date.now() / 1000;
    const pulseRadius = this.config.UNIT_RADIUS + 8 + Math.sin(time * 4) * 3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, this.config.UNIT_RADIUS + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawUnit(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
    currentTurn: 1 | 2,
  ): void {
    const strategy = UnitRenderStrategyFactory.getStrategy(unit.type);

    // Draw the unit shape using the strategy
    strategy.drawUnitShape(ctx, unit, centerX, centerY, this.config);

    // Draw turn indicator for active units
    if (unit.team === currentTurn && !unit.isSelected && !unit.hasActed) {
      const visualConfig = strategy.getVisualConfig();
      const baseColor =
        unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

      ctx.beginPath();
      ctx.arc(centerX, centerY, this.config.UNIT_RADIUS + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(${baseColor}, 0.3)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw special effects if available
    if (strategy.drawSpecialEffects) {
      strategy.drawSpecialEffects(ctx, unit, centerX, centerY, this.config);
    }
    // Draw damage effect if unit was recently hit
    if (unit.receivedDamageFrom) {
      this.addDamageEffect(
        unit,
        unit.receivedDamageFrom.type,
        centerX,
        centerY,
      );
    }
  }

  private drawInactiveOverlay(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
  ): void {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 3;

    const offset = this.config.UNIT_RADIUS * 0.7;

    ctx.beginPath();
    ctx.moveTo(centerX - offset, centerY - offset);
    ctx.lineTo(centerX + offset, centerY + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - offset, centerY + offset);
    ctx.lineTo(centerX + offset, centerY - offset);
    ctx.stroke();
  }

  private drawHealthBar(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
  ): void {
    const barWidth = 60;
    const barHeight = 6;
    const barX = centerX - barWidth / 2;
    const barY = centerY - this.config.UNIT_RADIUS - 15;

    const healthPercent = this.unitManager.getHealthPercentage(unit);

    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const healthWidth = barWidth * healthPercent;
    if (healthPercent > 0.6) {
      ctx.fillStyle = "#4ade80";
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = "#fbbf24";
    } else {
      ctx.fillStyle = "#ef4444";
    }
    ctx.fillRect(barX, barY, healthWidth, barHeight);
  }

  private drawUnitStats(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
  ): void {
    ctx.fillStyle = "white";
    ctx.font = "bold 9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "black";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Position stats below the unit and type symbol
    const statsY = centerY + this.config.UNIT_RADIUS + 25;
    const spacing = 25; // Horizontal spacing between ATT and LIF

    // Draw ATT on the left, LIF on the right
    ctx.fillText(`ATT:${unit.att}`, centerX - spacing, statsY);
    ctx.fillText(`LIF:${unit.lif}`, centerX + spacing, statsY);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  private drawUnitTypeSymbol(
    ctx: CanvasRenderingContext2D,
    unit: Unit,
    centerX: number,
    centerY: number,
  ): void {
    const strategy = UnitRenderStrategyFactory.getStrategy(unit.type);
    const visualConfig = strategy.getVisualConfig();

    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "black";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(
      visualConfig.symbol,
      centerX,
      centerY + this.config.UNIT_RADIUS + 8,
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}
