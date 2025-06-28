import type { UnitRenderStrategy } from "./UnitRenderStrategy.js";
import { ArcherRenderStrategy } from "./ArcherRenderStrategy.js";
import { MageRenderStrategy } from "./MageRenderStrategy.js";
import { KnightRenderStrategy } from "./KnightRenderStrategy.js";
import { PriestRenderStrategy } from "./PriestRenderStrategy.js";

export class UnitRenderStrategyFactory {
  private static strategies: Map<string, UnitRenderStrategy> = new Map();

  static {
    // Initialize render strategies with their IDs
    this.strategies.set("archer", new ArcherRenderStrategy());
    this.strategies.set("mage", new MageRenderStrategy());
    this.strategies.set("knight", new KnightRenderStrategy());
    this.strategies.set("priest", new PriestRenderStrategy());
  }

  public static getStrategy(renderStrategyId: string): UnitRenderStrategy {
    const strategy = this.strategies.get(renderStrategyId.toLowerCase());
    if (!strategy) {
      console.warn(`Render strategy '${renderStrategyId}' not found, falling back to archer strategy`);
      return this.strategies.get("archer")!;
    }
    return strategy;
  }

  public static registerStrategy(strategyId: string, strategy: UnitRenderStrategy): void {
    this.strategies.set(strategyId.toLowerCase(), strategy);
  }

  public static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  public static hasStrategy(strategyId: string): boolean {
    return this.strategies.has(strategyId.toLowerCase());
  }
}