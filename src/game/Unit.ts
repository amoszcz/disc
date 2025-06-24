import type { Unit, GameConfig } from '../types/GameTypes.js';

export class UnitManager {
    private config: GameConfig;

    constructor(config: GameConfig) {
        this.config = config;
    }

    public createUnit(team: 1 | 2, row: number, col: number): Unit {
        return {
            team: team,
            row: row,
            col: col,
            att: this.config.DEFAULT_ATT,
            lif: this.config.DEFAULT_LIF,
            maxLif: this.config.DEFAULT_LIF,
            isAlive: true
        };
    }

    public damageUnit(unit: Unit, damage: number): void {
        unit.lif -= damage;
        this.updateUnitStatus(unit);
    }

    public updateUnitStatus(unit: Unit): void {
        if (unit.lif <= 0) {
            unit.isAlive = false;
            unit.lif = 0;
        }
    }

    public getHealthPercentage(unit: Unit): number {
        return unit.lif / unit.maxLif;
    }

    public isUnitAlive(unit: Unit | null): unit is Unit {
        return unit !== null && unit.isAlive;
    }
}