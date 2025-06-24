import type { Unit, GameConfig, AttackResult } from '../types/GameTypes.js';

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
            isAlive: true,
            isSelected: false,
            hasActed: false
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
            unit.isSelected = false;
            unit.hasActed = true; // Dead units are considered "acted"
        }
    }

    public getHealthPercentage(unit: Unit): number {
        return unit.lif / unit.maxLif;
    }

    public isUnitAlive(unit: Unit | null): unit is Unit {
        return unit !== null && unit.isAlive;
    }

    public selectUnit(unit: Unit): void {
        unit.isSelected = true;
    }

    public deselectUnit(unit: Unit): void {
        unit.isSelected = false;
    }

    public canSelectUnit(unit: Unit, currentTeam: 1 | 2): boolean {
        return unit.isAlive && unit.team === currentTeam && !unit.hasActed;
    }

    public canAttackTarget(attacker: Unit, target: Unit): boolean {
        return attacker.isAlive &&
            target.isAlive &&
            attacker.team !== target.team &&
            !attacker.hasActed;
    }

    public performAttack(attacker: Unit, target: Unit): AttackResult {
        if (!this.canAttackTarget(attacker, target)) {
            return {
                success: false,
                damage: 0,
                targetKilled: false,
                message: "Cannot attack this target"
            };
        }

        const damage = attacker.att;
        const targetLifeBefore = target.lif;

        this.damageUnit(target, damage);
        attacker.hasActed = true;
        attacker.isSelected = false; // Deselect after acting

        const targetKilled = !target.isAlive;

        return {
            success: true,
            damage: damage,
            targetKilled: targetKilled,
            message: `${damage} damage dealt${targetKilled ? ' - Target eliminated!' : ''}`
        };
    }

    public resetUnitActivity(unit: Unit): void {
        if (unit.isAlive) {
            unit.hasActed = false;
        }
    }

    public isUnitActive(unit: Unit): boolean {
        return unit.isAlive && !unit.hasActed;
    }

    public getAllActiveUnits(board: (Unit | null)[][], team: 1 | 2, boardRows: number, boardCols: number): Unit[] {
        const activeUnits: Unit[] = [];

        for (let row = 0; row < boardRows; row++) {
            for (let col = 0; col < boardCols; col++) {
                const unit = board[row][col];
                if (unit && unit.team === team && this.isUnitActive(unit)) {
                    activeUnits.push(unit);
                }
            }
        }

        return activeUnits;
    }
}