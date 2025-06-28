import { GameConfig } from "./types/GameTypes.js";
import type { BattleSetup, BattleUnit } from "./types/BattleTypes.js";
import { BattleModuleFactory } from "./battle/BattleModuleFactory.js";
import { UnitFactory } from "./utils/UnitFactory.js";

// Game configuration
const CONFIG: GameConfig = {
  BOARD_ROWS: 3,
  BOARD_COLS: 4,
  CELL_SIZE: 120,
  UNIT_RADIUS: 35,
  DEFAULT_ATT: 25,
  DEFAULT_LIF: 100,
};

// Example battle setup using configuration-based units
const createExampleBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team1-archer1",
      "archer",
      1,
      { row: 0, col: 0 },
      0.8 // 80% health
    ),
    UnitFactory.createNewBattleUnit(
      "team1-mage1",
      "mage",
      1,
      { row: 1, col: 0 },
      1.0, // Full health
      { attMultiplier: 1.2 } // 20% attack bonus
    ),
    UnitFactory.createNewBattleUnit(
      "team1-knight1",
      "knight",
      1,
      { row: 2, col: 0 },
      0.9 // 90% health
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-archer1",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0 // Full health
    ),
    UnitFactory.createNewBattleUnit(
      "team2-priest1",
      "priest",
      2,
      { row: 1, col: 3 },
      0.7, // 70% health
      { lifMultiplier: 1.1 } // 10% life bonus
    ),
    UnitFactory.createNewBattleUnit(
      "team2-knight1",
      "knight",
      2,
      { row: 2, col: 3 },
      0.95 // 95% health
    ),
  ];

  return { team1Units, team2Units };
};

// Example of creating a battle with wounded units and stat modifiers
const createWoundedBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team1-veteran-knight",
      "knight",
      1,
      { row: 1, col: 1 },
      0.6, // Wounded veteran
      { 
        attMultiplier: 1.3, // +30% attack from experience
        lifMultiplier: 1.1  // +10% max life
      }
    ),
    UnitFactory.createNewBattleUnit(
      "team1-weakened-mage",
      "mage",
      1,
      { row: 0, col: 0 },
      0.3, // Badly wounded
      { attMultiplier: 0.8 } // -20% attack due to weakness
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-fresh-archer",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0 // Fresh unit at full strength
    ),
    UnitFactory.createNewBattleUnit(
      "team2-blessed-priest",
      "priest",
      2,
      { row: 1, col: 2 },
      1.0,
      { 
        attMultiplier: 1.1, // +10% healing power
        lifMultiplier: 1.2  // +20% max life from blessing
      }
    ),
  ];

  return { team1Units, team2Units };
};

// Helper function to log battle setup details
const logBattleSetup = (battleSetup: BattleSetup): void => {
  console.log("=== Battle Setup Details ===");
  
  const logTeam = (teamUnits: BattleUnit[], teamName: string) => {
    console.log(`\n${teamName}:`);
    teamUnits.forEach(unit => {
      const config = UnitFactory.getUnitConfig(unit.unitTypeId);
      const baseLife = config?.baseStats.lif || 0;
      const lifMultiplier = unit.statModifiers?.lifMultiplier || 1;
      const maxLife = Math.round(baseLife * lifMultiplier);
      const currentLife = Math.round(maxLife * unit.lifePercentage);
      
      console.log(
        `  ${unit.id}: ${config?.name || unit.unitTypeId} ` +
        `at (${unit.position.row}, ${unit.position.col}) - ` +
        `${currentLife}/${maxLife} HP (${Math.round(unit.lifePercentage * 100)}%)`
      );
      
      if (unit.statModifiers?.attMultiplier) {
        console.log(`    Attack modifier: ${Math.round((unit.statModifiers.attMultiplier - 1) * 100)}%`);
      }
      if (unit.statModifiers?.lifMultiplier) {
        console.log(`    Life modifier: ${Math.round((unit.statModifiers.lifMultiplier - 1) * 100)}%`);
      }
    });
  };
  
  logTeam(battleSetup.team1Units, "Team 1");
  logTeam(battleSetup.team2Units, "Team 2");
  console.log("\n" + "=".repeat(30));
};

// Initialize and start the battle when page loads
window.addEventListener("load", async () => {
  try {
    // Use either the example or wounded battle setup
    const battleSetup = createExampleBattle(); // or createWoundedBattle()
    
    logBattleSetup(battleSetup);
    
    const battleModule = await BattleModuleFactory.createQuickBattle(
      "game",
      battleSetup,
      CONFIG,
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