import type { Unit, UnitType } from '../types/GameTypes.js';
import type { BattleUnit } from '../types/BattleTypes.js';
import type { UnitConfig } from '../types/UnitConfig.js';
import { ConfigLoader } from '../config/ConfigLoader.js';

export class UnitFactory {
    private static configLoader = ConfigLoader.getInstance();

    /**
     * Creates a game Unit from a BattleUnit using configuration data
     */
    public static createUnitFromBattleUnit(battleUnit: BattleUnit): Unit {
        const unitConfig = this.configLoader.getUnitConfig(battleUnit.unitTypeId);

        if (!unitConfig) {
            throw new Error(`Unit configuration not found for type: ${battleUnit.unitTypeId}`);
        }

        // Calculate actual stats from base stats and modifiers
        const baseAtt = unitConfig.baseStats.att;
        const baseLif = unitConfig.baseStats.lif;

        const attMultiplier = battleUnit.statModifiers?.attMultiplier || 1.0;
        const lifMultiplier = battleUnit.statModifiers?.lifMultiplier || 1.0;

        const finalMaxLif = Math.round(baseLif * lifMultiplier);
        const finalAtt = Math.round(baseAtt * attMultiplier);
        const currentLif = Math.round(finalMaxLif * battleUnit.lifePercentage);

        return {
            team: battleUnit.team,
            row: battleUnit.position.row,
            col: battleUnit.position.col,
            att: finalAtt,
            lif: Math.max(1, currentLif), // Ensure at least 1 life
            maxLif: finalMaxLif,
            isAlive: currentLif > 0,
            isSelected: false,
            hasActed: false,
            type: battleUnit.unitTypeId as UnitType,
            receivedDamageFrom: null
        };
    }

    /**
     * Creates a BattleUnit from a game Unit
     */
    public static createBattleUnitFromUnit(unit: Unit, id: string): BattleUnit {
        const lifePercentage = unit.maxLif > 0 ? unit.lif / unit.maxLif : 0;

        return {
            id,
            unitTypeId: unit.type,
            team: unit.team,
            lifePercentage,
            position: {
                row: unit.row,
                col: unit.col
            }
        };
    }

    /**
     * Creates a new BattleUnit with full health
     */
    public static createNewBattleUnit(
        id: string,
        unitTypeId: string,
        team: 1 | 2,
        position: { row: number; col: number },
        lifePercentage: number = 1.0,
        statModifiers?: { attMultiplier?: number; lifMultiplier?: number }
    ): BattleUnit {
        const unitConfig = this.configLoader.getUnitConfig(unitTypeId);

        if (!unitConfig) {
            throw new Error(`Unit configuration not found for type: ${unitTypeId}`);
        }

        return {
            id,
            unitTypeId,
            team,
            lifePercentage: Math.max(0, Math.min(1, lifePercentage)), // Clamp between 0 and 1
            position,
            statModifiers
        };
    }

    /**
     * Gets unit configuration
     */
    public static getUnitConfig(unitTypeId: string): UnitConfig | null {
        return this.configLoader.getUnitConfig(unitTypeId);
    }

    /**
     * Validates if a unit type exists
     */
    public static isValidUnitType(unitTypeId: string): boolean {
        return this.configLoader.isValidUnitType(unitTypeId);
    }

    /**
     * Gets all available unit types
     */
    public static getAvailableUnitTypes(): string[] {
        return this.configLoader.getAvailableUnitTypes();
    }
}