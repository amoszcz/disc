import type { BattleModule, BattleSetup } from "../types/BattleTypes.js";
import type { GameConfig } from "../types/GameTypes.js";
import { BattleManager } from "./BattleManager.js";

export class BattleModuleFactory {
  public static createBattleModule(
    canvasIdOrGame: string | import("../core/Game.js").Game,
    config?: Partial<GameConfig>,
  ): BattleModule {
    return new BattleManager(canvasIdOrGame as any, config);
  }

  public static async createQuickBattle(
    canvasIdOrGame: string | import("../core/Game.js").Game,
    battleSetup: BattleSetup,
    config?: Partial<GameConfig>,
  ): Promise<BattleModule> {
    const battleModule = this.createBattleModule(canvasIdOrGame as any, config);
    await battleModule.setupBattle(battleSetup);
    return battleModule;
  }
}
