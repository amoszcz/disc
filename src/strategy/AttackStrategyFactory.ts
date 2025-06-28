import type { AttackStrategy } from "./AttackStrategy.js";
import { ArcherAttackStrategy } from "./ArcherAttackStrategy.js";
import { MageAttackStrategy } from "./MageAttackStrategy.js";
import { KnightAttackStrategy } from "./KnightAttackStrategy.js";
import { PriestAttackStrategy } from "./PriestAttackStrategy.js";

export class AttackStrategyFactory {
  private static strategies: Map<string, AttackStrategy> = new Map();

  static {
    // Initialize strategies with their IDs
    this.strategies.set("archer", new ArcherAttackStrategy());
    this.strategies.set("mage", new MageAttackStrategy());
    this.strategies.set("knight", new KnightAttackStrategy());
    this.strategies.set("priest", new PriestAttackStrategy());
  }

  public static getStrategy(strategyId: string): AttackStrategy {
    const strategy = this.strategies.get(strategyId.toLowerCase());
    if (!strategy) {
      console.warn(
        `Attack strategy '${strategyId}' not found, falling back to archer strategy`,
      );
      return this.strategies.get("archer")!;
    }
    return strategy;
  }

  public static registerStrategy(
    strategyId: string,
    strategy: AttackStrategy,
  ): void {
    this.strategies.set(strategyId.toLowerCase(), strategy);
  }

  public static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  public static hasStrategy(strategyId: string): boolean {
    return this.strategies.has(strategyId.toLowerCase());
  }
}
