import type { AttackStrategy } from './AttackStrategy.js';
import { UnitType } from '../types/GameTypes.js';
import { ArcherAttackStrategy } from './ArcherAttackStrategy.js';
import { MageAttackStrategy } from './MageAttackStrategy.js';
import { PriestAttackStrategy } from './PriestAttackStrategy.js';

export class AttackStrategyFactory {
    private static strategies: Map<UnitType, AttackStrategy> = new Map([
        [UnitType.ARCHER, new ArcherAttackStrategy()],
        [UnitType.MAGE, new MageAttackStrategy()],
        [UnitType.PRIEST, new PriestAttackStrategy()]
    ]);

    public static getStrategy(unitType: UnitType): AttackStrategy {
        const strategy = this.strategies.get(unitType);
        if (!strategy) {
            throw new Error(`No attack strategy found for unit type: ${unitType}`);
        }
        return strategy;
    }

    public static getAllStrategies(): Map<UnitType, AttackStrategy> {
        return new Map(this.strategies);
    }
}