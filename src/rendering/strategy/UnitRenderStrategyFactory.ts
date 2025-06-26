import type { UnitRenderStrategy } from "./UnitRenderStrategy.js";
import { UnitType } from "../../types/GameTypes.js";
import { ArcherRenderStrategy } from "./ArcherRenderStrategy.js";
import { MageRenderStrategy } from "./MageRenderStrategy.js";
import { PriestRenderStrategy } from "./PriestRenderStrategy.js";

import { KnightRenderStrategy } from "./KnightRenderStrategy.js";

export class UnitRenderStrategyFactory {
  private static strategies: Map<UnitType, UnitRenderStrategy> = new Map([
    [UnitType.ARCHER, new ArcherRenderStrategy()],
    [UnitType.MAGE, new MageRenderStrategy()],
    [UnitType.PRIEST, new PriestRenderStrategy()],
    [UnitType.KNIGHT, new KnightRenderStrategy()],
  ]);

  public static getStrategy(unitType: UnitType): UnitRenderStrategy {
    const strategy = this.strategies.get(unitType);
    if (!strategy) {
      throw new Error(`No render strategy found for unit type: ${unitType}`);
    }
    return strategy;
  }

  public static getAllStrategies(): Map<UnitType, UnitRenderStrategy> {
    return new Map(this.strategies);
  }

  public static registerStrategy(
    unitType: UnitType,
    strategy: UnitRenderStrategy,
  ): void {
    this.strategies.set(unitType, strategy);
  }
}
