import type { BattleSetup, BattleUnit } from "../types/BattleTypes.js";
import { UnitFactory } from "./UnitFactory.js";
import CONFIG from "../config/GameConfig.js";

// Helper: generate a random integer in [min, max]
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const createExampleBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team1-archer1",
      "archer",
      1,
      { row: 0, col: 0 },
      0.8,
    ),
    UnitFactory.createNewBattleUnit(
      "team1-mage1",
      "mage",
      1,
      { row: 1, col: 0 },
      1.0,
      { attMultiplier: 1.2 },
    ),
    UnitFactory.createNewBattleUnit(
      "team1-knight1",
      "knight",
      1,
      { row: 2, col: 0 },
      0.9,
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-archer1",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0,
    ),
    UnitFactory.createNewBattleUnit(
      "team2-priest1",
      "priest",
      2,
      { row: 1, col: 3 },
      0.7,
      { lifMultiplier: 1.1 },
    ),
    UnitFactory.createNewBattleUnit(
      "team2-knight1",
      "knight",
      2,
      { row: 2, col: 3 },
      0.95,
    ),
  ];

  return { team1Units, team2Units };
};

export const createWoundedBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team1-veteran-knight",
      "knight",
      1,
      { row: 1, col: 1 },
      0.6,
      {
        attMultiplier: 1.3,
        lifMultiplier: 1.1,
      },
    ),
    UnitFactory.createNewBattleUnit(
      "team1-weakened-mage",
      "mage",
      1,
      { row: 0, col: 0 },
      0.3,
      { attMultiplier: 0.8 },
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-fresh-archer",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0,
    ),
    UnitFactory.createNewBattleUnit(
      "team2-blessed-priest",
      "priest",
      2,
      { row: 1, col: 2 },
      1.0,
      {
        attMultiplier: 1.1,
        lifMultiplier: 1.2,
      },
    ),
  ];

  return { team1Units, team2Units };
};

export const logBattleSetup = (battleSetup: BattleSetup): void => {
  console.log("=== Battle Setup Details ===");

  const logTeam = (teamUnits: BattleUnit[], teamName: string) => {
    console.log(`\n${teamName}:`);
    teamUnits.forEach((unit) => {
      const config = UnitFactory.getUnitConfig(unit.unitTypeId);
      const baseLife = config?.baseStats.lif || 0;
      const lifMultiplier = unit.statModifiers?.lifMultiplier || 1;
      const maxLife = Math.round(baseLife * lifMultiplier);
      const currentLife = Math.round(maxLife * unit.lifePercentage);

      console.log(
        `  ${unit.id}: ${config?.name || unit.unitTypeId} ` +
          `at (${unit.position.row}, ${unit.position.col}) - ` +
          `${currentLife}/${maxLife} HP (${Math.round(unit.lifePercentage * 100)}%)`,
      );

      if (unit.statModifiers?.attMultiplier) {
        console.log(
          `    Attack modifier: ${Math.round((unit.statModifiers.attMultiplier - 1) * 100)}%`,
        );
      }
      if (unit.statModifiers?.lifMultiplier) {
        console.log(
          `    Life modifier: ${Math.round((unit.statModifiers.lifMultiplier - 1) * 100)}%`,
        );
      }
    });
  };

  logTeam(battleSetup.team1Units, "Team 1");
  logTeam(battleSetup.team2Units, "Team 2");
  console.log("\n" + "=".repeat(30));
};

export const createRandomBattle = (): BattleSetup => {
  const rows = CONFIG.BOARD_ROWS;
  const cols = CONFIG.BOARD_COLS;
  const unitTypes = UnitFactory.getAvailableUnitTypes();

  const positionsUsed = new Set<string>();
  const makePosKey = (r: number, c: number) => `${r}-${c}`;
  const pickFreePos = (colRange: { min: number; max: number }) => {
    for (let tries = 0; tries < 100; tries++) {
      const r = randInt(0, rows - 1);
      const c = randInt(colRange.min, colRange.max);
      const key = makePosKey(r, c);
      if (!positionsUsed.has(key)) {
        positionsUsed.add(key);
        return { row: r, col: c };
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = colRange.min; c <= colRange.max; c++) {
        const key = makePosKey(r, c);
        if (!positionsUsed.has(key)) {
          positionsUsed.add(key);
          return { row: r, col: c };
        }
      }
    }
    return { row: 0, col: colRange.min };
  };

  const unitCountPerTeam = Math.max(1, Math.min(4, randInt(2, 3)));
  const pickType = () => unitTypes[randInt(0, unitTypes.length - 1)];

  const team1Units: BattleUnit[] = [];
  const team2Units: BattleUnit[] = [];

  for (let i = 0; i < unitCountPerTeam; i++) {
    const type = pickType();
    const pos = pickFreePos({ min: 0, max: Math.max(0, Math.floor((cols - 1) / 2)) });
    const lifePct = Math.max(0.5, Math.random());
    team1Units.push(
      UnitFactory.createNewBattleUnit(`t1-${type}-${i}-${Date.now()}`, type, 1, pos, lifePct),
    );
  }

  for (let i = 0; i < unitCountPerTeam; i++) {
    const type = pickType();
    const pos = pickFreePos({ min: Math.floor(cols / 2), max: cols - 1 });
    const lifePct = Math.max(0.5, Math.random());
    team2Units.push(
      UnitFactory.createNewBattleUnit(`t2-${type}-${i}-${Date.now()}`, type, 2, pos, lifePct),
    );
  }

  return { team1Units, team2Units };
};
