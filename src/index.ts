import { GameConfig, UnitType } from "./types/GameTypes.js";
import type { BattleSetup, BattleUnit } from "./types/BattleTypes.js";
import { BattleModuleFactory } from "./battle/BattleModuleFactory.js";

// Game configuration
const CONFIG: GameConfig = {
  BOARD_ROWS: 3,
  BOARD_COLS: 4,
  CELL_SIZE: 120,
  UNIT_RADIUS: 35,
  DEFAULT_ATT: 25,
  DEFAULT_LIF: 100,
};

// Example battle setup with explicit positions
const createExampleBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    {
      id: "team1-archer1",
      type: UnitType.ARCHER,
      team: 1,
      att: 30,
      lif: 80,
      maxLif: 80,
      position: { row: 0, col: 1 }, // Top-left corner
    },
    {
      id: "team1-mage1",
      type: UnitType.MAGE,
      team: 1,
      att: 35,
      lif: 60,
      maxLif: 60,
      position: { row: 1, col: 1 }, // Middle-left
    },
    {
      id: "team1-knight1",
      type: UnitType.KNIGHT,
      team: 1,
      att: 40,
      lif: 120,
      maxLif: 120,
      position: { row: 2, col: 1 }, // Bottom-left
    },
  ];

  const team2Units: BattleUnit[] = [
    {
      id: "team2-archer1",
      type: UnitType.ARCHER,
      team: 2,
      att: 30,
      lif: 80,
      maxLif: 80,
      position: { row: 0, col: 2 }, // Top-right corner
    },
    {
      id: "team2-priest1",
      type: UnitType.PRIEST, // Fixed: was MAGE, should be PRIEST
      team: 2,
      att: 20,
      lif: 90,
      maxLif: 90,
      position: { row: 1, col: 2 }, // Middle-right
    },
    {
      id: "team2-knight1",
      type: UnitType.KNIGHT,
      team: 2,
      att: 40,
      lif: 120,
      maxLif: 120,
      position: { row: 2, col: 2 }, // Bottom-right
    },
  ];

  return { team1Units, team2Units };
};

// Example of creating a more complex battle formation
const createComplexBattle = (): BattleSetup => {
  const team1Units: BattleUnit[] = [
    {
      id: "team1-knight-front",
      type: UnitType.KNIGHT,
      team: 1,
      att: 45,
      lif: 130,
      maxLif: 130,
      position: { row: 1, col: 1 }, // Front line tank
    },
    {
      id: "team1-archer-back",
      type: UnitType.ARCHER,
      team: 1,
      att: 35,
      lif: 70,
      maxLif: 70,
      position: { row: 0, col: 0 }, // Back line archer
    },
    {
      id: "team1-mage-back",
      type: UnitType.MAGE,
      team: 1,
      att: 40,
      lif: 55,
      maxLif: 55,
      position: { row: 2, col: 0 }, // Back line mage
    },
  ];

  const team2Units: BattleUnit[] = [
    {
      id: "team2-knight-front",
      type: UnitType.KNIGHT,
      team: 2,
      att: 42,
      lif: 125,
      maxLif: 125,
      position: { row: 1, col: 2 }, // Front line tank
    },
    {
      id: "team2-priest-support",
      type: UnitType.PRIEST,
      team: 2,
      att: 15,
      lif: 85,
      maxLif: 85,
      position: { row: 0, col: 3 }, // Support healer
    },
    {
      id: "team2-archer-back",
      type: UnitType.ARCHER,
      team: 2,
      att: 32,
      lif: 75,
      maxLif: 75,
      position: { row: 2, col: 3 }, // Back line archer
    },
  ];

  return { team1Units, team2Units };
};

// Initialize and start the battle when page loads
window.addEventListener("load", async () => {
  try {
    // Use either the simple or complex battle setup
    const battleSetup = createExampleBattle(); // or createComplexBattle()

    console.log("Setting up battle with the following formations:");
    console.log(
      "Team 1:",
      battleSetup.team1Units.map(
        (u) => `${u.type} at (${u.position.row}, ${u.position.col})`,
      ),
    );
    console.log(
      "Team 2:",
      battleSetup.team2Units.map(
        (u) => `${u.type} at (${u.position.row}, ${u.position.col})`,
      ),
    );

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
