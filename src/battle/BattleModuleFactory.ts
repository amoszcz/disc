import type { BattleModule, BattleSetup } from '../types/BattleTypes.js';
import type { GameConfig } from '../types/GameTypes.js';
import { BattleManager } from './BattleManager.js';

export class BattleModuleFactory {
    public static createBattleModule(
        canvasId: string,
        config?: Partial<GameConfig>
    ): BattleModule {
        return new BattleManager(canvasId, config);
    }

    public static async createQuickBattle(
        canvasId: string,
        battleSetup: BattleSetup,
        config?: Partial<GameConfig>
    ): Promise<BattleModule> {
        const battleModule = this.createBattleModule(canvasId, config);
        await battleModule.setupBattle(battleSetup);
        return battleModule;
    }
}