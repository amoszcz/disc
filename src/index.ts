import {GameConfig, UnitType} from "./types/GameTypes.js";
import type {BattleSetup, BattleUnit} from "./types/BattleTypes.js";
import {BattleModuleFactory} from "./battle/BattleModuleFactory.js";

// Game configuration
const CONFIG: GameConfig = {
  BOARD_ROWS: 3,
  BOARD_COLS: 4,
  CELL_SIZE: 120,
  UNIT_RADIUS: 35,
  DEFAULT_ATT: 25,
  DEFAULT_LIF: 100,
};

// Example battle setup
const createExampleBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    { id: "team1-archer1", type: UnitType.ARCHER, team: 1, att: 30, lif: 80, maxLif: 80 },
    { id: "team1-mage1", type: UnitType.MAGE, team: 1, att: 35, lif: 60, maxLif: 60 },
    { id: "team1-knight1", type: UnitType.KNIGHT, team: 1, att: 40, lif: 120, maxLif: 120 },
  ];

  const team2Units: BattleUnit[] = [
    { id: "team2-archer1", type: UnitType.ARCHER, team: 2, att: 30, lif: 80, maxLif: 80 },
    { id: "team2-priest1", type: UnitType.MAGE, team: 2, att: 20, lif: 90, maxLif: 90 },
    { id: "team2-knight1", type: UnitType.KNIGHT, team: 2, att: 40, lif: 120, maxLif: 120 },
  ];

  return { team1Units, team2Units };
};

// Initialize and start the battle when page loads
window.addEventListener("load", async () => {
  try {
    const battleSetup = createExampleBattle();
    const battleModule = await BattleModuleFactory.createQuickBattle(
        "game",
        battleSetup,
        CONFIG
    );

    // Setup event listeners
    battleModule.onBattleEvent = (event) => {
      console.log("Battle Event:", event);
    };

    battleModule.onBattleEnd = (result) => {
      console.log("Battle Result:", result);
      alert(`Battle ended! Winner: ${result.winner}`);
    };

    // Start the battle
    const result = await battleModule.startBattle();
    console.log("Final battle result:", result);

  } catch (error) {
    console.error("Error starting the battle:", error);
  }
});