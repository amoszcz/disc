import { Game } from "./core/Game.js";
import CONFIG from "./config/GameConfig.js";
import { MapModule, type MapSnapshot } from "./map/MapModule.js";
import { BattleModuleFactory } from "./battle/BattleModuleFactory.js";
import { createRandomBattle, logBattleSetup } from "./utils/BattleSetupUtils.js";

window.addEventListener("load", () => {
  let game: Game | null = null; // used for menu or battle sessions
  let map: MapModule | null = null;
  let mapSnapshot: MapSnapshot | null = null; // persist map state across battles

  const startMenu = () => {
    // Initialize Game independently in MENU state
    game = new Game(CONFIG, "game");
    game
      .init()
      .catch((e) => console.error("Failed to init Game:", e));

    // Listen to start via app event bus (decoupled from window)
    import("./utils/EventBus.js").then(({ appEventBus }) => {
      appEventBus.on("startGame", () => {
        // Stop menu/game loop and start map module
        if (game) {
          game.stop();
          game = null;
        }
        startMap();
      });
    });
  };

  const startMap = () => {
    map = new MapModule("game", { gridSize: 20, initialState: mapSnapshot ?? undefined });
    map.onExit = () => {
      // Return to menu when user presses R
      if (map) {
        // update snapshot before leaving
        mapSnapshot = map.getSnapshot();
        map.stop();
        map = null;
      }
      startMenu();
    };
    map.onSquareReached = async (squareId, snapshot) => {
      // Persist the state with the specific square removed
      mapSnapshot = {
        playerRow: snapshot.playerRow,
        playerCol: snapshot.playerCol,
        playerSelected: false, // reset selection when entering battle
        squares: snapshot.squares.filter((s) => s.id !== squareId),
      };
      // Stop map and launch a random battle
      if (map) {
        map.stop();
        map = null;
      }
      await startBattleThenReturnToMap();
    };
    map.start();
  };

  const startBattleThenReturnToMap = async () => {
    try {
      // Create a fresh Game for battle
      game = new Game(CONFIG, "game");
      await game.init();

      const battleSetup = createRandomBattle();
      logBattleSetup(battleSetup);

      const battle = await BattleModuleFactory.createQuickBattle(
        "game",
        battleSetup,
        game,
        CONFIG,
      );

      battle.onBattleEnd = (result) => {
        console.log("Battle Result:", result);
      };

      const finalResult = await battle.startBattle();
      console.log("Final battle result:", finalResult);
    } catch (e) {
      console.error("Error during battle:", e);
    } finally {
      // Stop the battle game loop and return to map
      if (game) {
        game.stop();
        game = null;
      }
      startMap();
    }
  };

  startMenu();
});
