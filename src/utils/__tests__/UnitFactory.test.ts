import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UnitFactory } from '../../battle/UnitFactory.js';
import type { UnitConfig } from '../../types/UnitConfig.js';
import type { BattleUnit } from '../../battle/BattleTypes.js';

const mockConfig: UnitConfig = {
  unitTypeId: 'archer',
  name: 'Archer',
  baseStats: { att: 10, lif: 50 },
  attackStrategyId: 'basic',
  renderStrategyId: 'svg',
};

const mockLoader = {
  getUnitConfig: (id: string) => (id.toLowerCase() === 'archer' ? mockConfig : null),
  isValidUnitType: (id: string) => id.toLowerCase() === 'archer',
  getAvailableUnitTypes: () => ['archer'],
};

describe('UnitFactory', () => {
  beforeEach(() => {
    UnitFactory.setConfigLoaderForTests(mockLoader as any);
  });
  afterEach(() => {
    UnitFactory.resetConfigLoader();
  });

  it('creates Unit from BattleUnit with stat modifiers applied', () => {
    const bu: BattleUnit = {
      id: 'u1',
      unitTypeId: 'archer',
      team: 1,
      lifePercentage: 0.5, // 50%
      position: { row: 2, col: 3 },
      statModifiers: { attMultiplier: 1.2, lifMultiplier: 1.5 },
    };

    const unit = UnitFactory.createUnitFromBattleUnit(bu);
    // base att=10 *1.2 => 12
    expect(unit.att).toBe(12);
    // base lif=50 *1.5 => maxLif=75, current lif at 50% => 38 (rounded)
    expect(unit.maxLif).toBe(75);
    expect(unit.lif).toBe(38);
    expect(unit.isAlive).toBe(true);
    expect(unit.attackStrategyId).toBe('basic');
    expect(unit.renderStrategyId).toBe('svg');
  });

  it('ensures minimum 1 life when percentage rounds to 0', () => {
    const bu: BattleUnit = {
      id: 'u2',
      unitTypeId: 'archer',
      team: 2,
      lifePercentage: 0.0,
      position: { row: 0, col: 0 },
    };
    const unit = UnitFactory.createUnitFromBattleUnit(bu);
    expect(unit.lif).toBe(1);
    expect(unit.isAlive).toBe(false);
  });

  it('createBattleUnitFromUnit maps fields and computes lifePercentage', () => {
    const bu = UnitFactory.createBattleUnitFromUnit(
      {
        team: 1,
        row: 5,
        col: 6,
        att: 12,
        lif: 30,
        maxLif: 60,
        isAlive: true,
        isSelected: false,
        hasActed: false,
        type: 'archer' as any,
        attackStrategyId: 'basic',
        renderStrategyId: 'svg',
        receivedDamageFrom: null,
      },
      'id-123',
    );
    expect(bu).toEqual({
      id: 'id-123',
      unitTypeId: 'archer',
      team: 1,
      lifePercentage: 0.5,
      position: { row: 5, col: 6 },
    });
  });

  it('createNewBattleUnit clamps lifePercentage and throws on missing config', () => {
    // With valid type
    const created = UnitFactory.createNewBattleUnit('id-x', 'archer', 1, { row: 1, col: 1 }, 2);
    expect(created.lifePercentage).toBe(1);

    // With invalid type => simulate missing config
    UnitFactory.setConfigLoaderForTests({
      ...mockLoader,
      getUnitConfig: () => null,
      isValidUnitType: () => false,
    } as any);
    expect(() => UnitFactory.createNewBattleUnit('id-y', 'unknown', 2, { row: 0, col: 0 })).toThrow();
  });
});
