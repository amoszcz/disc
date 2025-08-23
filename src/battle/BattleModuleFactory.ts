import type { BattleModule, BattleSetup } from "../types/BattleTypes.js";
import type { GameConfig } from "../types/GameTypes.js";
import { BattleManager } from "./BattleManager.js";
import { type Game } from "../core/Game.js";

export class BattleModuleFactory {
  public static createBattleModule(
    canvasId: string,
    game: Game,
    config: Partial<GameConfig>,
  ): BattleModule {
    return new BattleManager(canvasId, config, game);
  }

  public static async createQuickBattle(
    canvasId: string,
    battleSetup: BattleSetup,
    game: Game,
    config: Partial<GameConfig>,
  ): Promise<BattleModule> {
    const battleModule = this.createBattleModule(canvasId, game, config);
    await battleModule.setupBattle(battleSetup);
    return battleModule;
  }
}
