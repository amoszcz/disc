import { BattleModuleFactory } from "./battle/BattleModuleFactory.js";
import { Game } from "./core/Game.js";
import CONFIG from "./config/GameConfig.js";
import { createRandomBattle, logBattleSetup } from "./utils/BattleSetupUtils.js";

let activeBattle: ReturnType<
  typeof BattleModuleFactory.createBattleModule
> | null = null;

// Decoupled startup: initialize Game in MENU state without creating any battle. Create battle only after user starts it.
window.addEventListener("load", () => {
  // Initialize Game independently in MENU state
  const game = new Game(CONFIG, "game");
  game.init().catch((e) => console.error("Failed to init Game:", e));
  // Battle session state


  // Create and start a battle only when requested by user
  const createAndSetupBattle = async (): Promise<void> => {
    const battleSetup = createRandomBattle();
    logBattleSetup(battleSetup);
    activeBattle = await BattleModuleFactory.createQuickBattle(
      "game",
      battleSetup,
      game,
      CONFIG,
    );

    // Forward events (optional logging)
    activeBattle.onBattleEvent = (event) => {
      console.log("Battle Event:", event);
      if (event.type === "battle_end") activeBattle = null;
    };
  };

  // Listen to start via app event bus (decoupled from window)
  import("./utils/EventBus.js").then(({ appEventBus }) => {
    appEventBus.on("startGame", async () => {
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
});
