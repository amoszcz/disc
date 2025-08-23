import { GameConfig } from "./types/GameTypes.js";
import type { BattleSetup, BattleUnit } from "./types/BattleTypes.js";
import { BattleModuleFactory } from "./battle/BattleModuleFactory.js";
import { UnitFactory } from "./utils/UnitFactory.js";
import { Game } from "./core/Game.js";

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
      0.8, // 80% health
    ),
    UnitFactory.createNewBattleUnit(
      "team1-mage1",
      "mage",
      1,
      { row: 1, col: 0 },
      1.0, // Full health
      { attMultiplier: 1.2 }, // 20% attack bonus
    ),
    UnitFactory.createNewBattleUnit(
      "team1-knight1",
      "knight",
      1,
      { row: 2, col: 0 },
      0.9, // 90% health
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-archer1",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0, // Full health
    ),
    UnitFactory.createNewBattleUnit(
      "team2-priest1",
      "priest",
      2,
      { row: 1, col: 3 },
      0.7, // 70% health
      { lifMultiplier: 1.1 }, // 10% life bonus
    ),
    UnitFactory.createNewBattleUnit(
      "team2-knight1",
      "knight",
      2,
      { row: 2, col: 3 },
      0.95, // 95% health
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
        lifMultiplier: 1.1, // +10% max life
      },
    ),
    UnitFactory.createNewBattleUnit(
      "team1-weakened-mage",
      "mage",
      1,
      { row: 0, col: 0 },
      0.3, // Badly wounded
      { attMultiplier: 0.8 }, // -20% attack due to weakness
    ),
  ];

  const team2Units: BattleUnit[] = [
    UnitFactory.createNewBattleUnit(
      "team2-fresh-archer",
      "archer",
      2,
      { row: 0, col: 3 },
      1.0, // Fresh unit at full strength
    ),
    UnitFactory.createNewBattleUnit(
      "team2-blessed-priest",
      "priest",
      2,
      { row: 1, col: 2 },
      1.0,
      {
        attMultiplier: 1.1, // +10% healing power
        lifMultiplier: 1.2, // +20% max life from blessing
      },
    ),
  ];

  return { team1Units, team2Units };
};

// Helper function to log battle setup details
const logBattleSetup = (battleSetup: BattleSetup): void => {
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

//
//
// window.addEventListener("load", () => {
//     // Create overlay menu (if it doesn’t exist yet)
//     let menu = document.getElementById("menu-overlay");
//     if (!menu) {
//         menu = document.createElement("div");
//         menu.id = "menu-overlay";
//         Object.assign(menu.style, {
//             position: "absolute",
//             inset: "0",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(0,0,0,0.6)",
//             color: "#fff",
//             zIndex: "10",
//             fontFamily: "sans-serif",
//         } as CSSStyleDeclaration);
//
//         const panel = document.createElement("div");
//         Object.assign(panel.style, {
//             background: "#222",
//             border: "1px solid #444",
//             borderRadius: "8px",
//             padding: "20px",
//             minWidth: "260px",
//             textAlign: "center",
//             boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
//         } as CSSStyleDeclaration);
//
//         const title = document.createElement("h1");
//         title.textContent = "Battle Simulator";
//         Object.assign(title.style, { marginTop: "0", fontSize: "20px" } as CSSStyleDeclaration);
//
//         const subtitle = document.createElement("div");
//         subtitle.id = "menu-subtitle";
//         subtitle.textContent = "Main Menu";
//         Object.assign(subtitle.style, { opacity: "0.8", marginBottom: "10px" } as CSSStyleDeclaration);
//
//         const randomBtn = document.createElement("button");
//         randomBtn.textContent = "Random battle";
//         Object.assign(randomBtn.style, {
//             padding: "10px 14px",
//             margin: "6px 0",
//             borderRadius: "6px",
//             border: "1px solid #666",
//             background: "#2e7d32",
//             color: "#fff",
//             cursor: "pointer",
//             fontWeight: "bold",
//         } as CSSStyleDeclaration);
//
//         panel.appendChild(title);
//         panel.appendChild(subtitle);
//         panel.appendChild(randomBtn);
//         menu.appendChild(panel);
//         document.body.appendChild(menu);
//
//         randomBtn.onclick = () => startRandomBattle();
//     }
//
//     const showMenu = (message?: string) => {
//         const subtitle = document.getElementById("menu-subtitle");
//         if (subtitle && message) subtitle.textContent = message;
//         const overlay = document.getElementById("menu-overlay");
//         if (overlay) overlay.style.display = "flex";
//     };
//     const hideMenu = () => {
//         const overlay = document.getElementById("menu-overlay");
//         if (overlay) overlay.style.display = "none";
//     };
//
//     // Local battle session state
//     let activeBattle: ReturnType<typeof BattleModuleFactory.createBattleModule> | null = null;
//
//     // Random helpers as you already have them
//     const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
//
//     const createRandomBattle = (): BattleSetup => {
//         const rows = CONFIG.BOARD_ROWS;
//         const cols = CONFIG.BOARD_COLS;
//         const unitTypes = UnitFactory.getAvailableUnitTypes();
//
//         const positionsUsed = new Set<string>();
//         const makePosKey = (r: number, c: number) => `${r}-${c}`;
//         const pickFreePos = (colRange: { min: number; max: number }) => {
//             for (let tries = 0; tries < 100; tries++) {
//                 const r = randInt(0, rows - 1);
//                 const c = randInt(colRange.min, colRange.max);
//                 const key = makePosKey(r, c);
//                 if (!positionsUsed.has(key)) {
//                     positionsUsed.add(key);
//                     return { row: r, col: c };
//                 }
//             }
//             for (let r = 0; r < rows; r++) {
//                 for (let c = colRange.min; c <= colRange.max; c++) {
//                     const key = makePosKey(r, c);
//                     if (!positionsUsed.has(key)) {
//                         positionsUsed.add(key);
//                         return { row: r, col: c };
//                     }
//                 }
//             }
//             return { row: 0, col: colRange.min };
//         };
//
//         const unitCountPerTeam = Math.max(1, Math.min(4, randInt(2, 3)));
//         const pickType = () => unitTypes[randInt(0, unitTypes.length - 1)];
//
//         const team1Units: BattleUnit[] = [];
//         const team2Units: BattleUnit[] = [];
//
//         for (let i = 0; i < unitCountPerTeam; i++) {
//             const type = pickType();
//             const pos = pickFreePos({ min: 0, max: Math.max(0, Math.floor((cols - 1) / 2)) });
//             const lifePct = Math.max(0.5, Math.random());
//             team1Units.push(
//                 UnitFactory.createNewBattleUnit(`t1-${type}-${i}-${Date.now()}`, type, 1, pos, lifePct),
//             );
//         }
//
//         for (let i = 0; i < unitCountPerTeam; i++) {
//             const type = pickType();
//             const pos = pickFreePos({ min: Math.floor(cols / 2), max: cols - 1 });
//             const lifePct = Math.max(0.5, Math.random());
//             team2Units.push(
//                 UnitFactory.createNewBattleUnit(`t2-${type}-${i}-${Date.now()}`, type, 2, pos, lifePct),
//             );
//         }
//
//         return { team1Units, team2Units };
//     };
//
//     async function startRandomBattle() {
//         hideMenu();
//         try {
//             const battleSetup = createRandomBattle();
//             logBattleSetup(battleSetup);
//
//             activeBattle = await BattleModuleFactory.createQuickBattle("game", battleSetup, CONFIG);
//
//             activeBattle.onBattleEvent = (event) => console.log("Battle Event:", event);
//
//             activeBattle.onBattleEnd = (result) => {
//                 console.log("Battle Result:", result);
//                 activeBattle = null;
//                 showMenu(`Last result: Winner ${result.winner}`);
//             };
//
//             const finalResult = await activeBattle.startBattle();
//             console.log("Final battle result:", finalResult);
//         } catch (error) {
//             console.error("Error starting the battle:", error);
//             showMenu("Error occurred. Back to menu");
//         }
//     }
//
//     // Crucial: show menu immediately, do not create any battle here.
//     showMenu();
// });


// Decoupled startup: initialize Game in MENU state without creating any battle. Create battle only after user starts it.
window.addEventListener("load", () => {
  // Initialize Game independently in MENU state
  const game = new Game(CONFIG, "game");
  game.init().catch((e) => console.error("Failed to init Game:", e));
  // Battle session state
  let activeBattle: ReturnType<typeof BattleModuleFactory.createBattleModule> | null = null;

  // Utility: generate a random integer in [min, max]
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Generate a random, valid battle setup based on CONFIG and available unit types
  const createRandomBattle = (): BattleSetup => {
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
        UnitFactory.createNewBattleUnit(
          `t1-${type}-${i}-${Date.now()}`,
          type,
          1,
          pos,
          lifePct,
        ),
      );
    }

    for (let i = 0; i < unitCountPerTeam; i++) {
      const type = pickType();
      const pos = pickFreePos({ min: Math.floor(cols / 2), max: cols - 1 });
      const lifePct = Math.max(0.5, Math.random());
      team2Units.push(
        UnitFactory.createNewBattleUnit(
          `t2-${type}-${i}-${Date.now()}`,
          type,
          2,
          pos,
          lifePct,
        ),
      );
    }

    return { team1Units, team2Units };
  };

  // Create and start a battle only when requested by user
  const createAndSetupBattle = async (): Promise<void> => {
    const battleSetup = createRandomBattle();
    logBattleSetup(battleSetup);
    activeBattle = await BattleModuleFactory.createQuickBattle(game, battleSetup, CONFIG);

    // Forward events (optional logging)
    activeBattle.onBattleEvent = (event) => {
      console.log("Battle Event:", event);
    };

    activeBattle.onBattleEnd = (result) => {
      console.log("Battle Result:", result);
      // Cleanup; the in-canvas UI will handle showing menu/return flow
      activeBattle = null;
    };
  };

  // Listen to the in-canvas menu "startGame" event
  window.addEventListener("startGame", async () => {
    try {
      if (!activeBattle) {
        await createAndSetupBattle();
      }
      if (activeBattle) {
        const finalResult = await activeBattle.startBattle();
        console.log("Final battle result:", finalResult);
      }
    } catch (error) {
      console.error("Error starting the battle:", error);
    }
  });
});
