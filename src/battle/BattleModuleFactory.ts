import type { BattleModule, BattleSetup } from "../types/BattleTypes.js";
import type { GameConfig } from "../types/GameTypes.js";
import { BattleManager } from "./BattleManager.js";
import type { IGame } from "../types/Ports.js";

export class BattleModuleFactory {
  public static createBattleModule(
    canvasId: string,
    game: IGame,
    config: Partial<GameConfig>,
  ): BattleModule {
    return new BattleManager(canvasId, config, game);
  }

  public static async createQuickBattle(
    canvasId: string,
    battleSetup: BattleSetup,
    game: IGame,
    config: Partial<GameConfig>,
  ): Promise<BattleModule> {
    const battleModule = this.createBattleModule(canvasId, game, config);
    await battleModule.setupBattle(battleSetup);
    return battleModule;
  }
}
