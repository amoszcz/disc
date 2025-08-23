import { Game } from "./core/Game.js";
import CONFIG from "./config/GameConfig.js";
import { MapModule } from "./map/MapModule.js";

window.addEventListener("load", () => {
  let game: Game | null = null;
  let map: MapModule | null = null;

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
        map = new MapModule("game", { gridSize: 20 });
        map.onExit = () => {
          // Return to menu when user presses R
          if (map) {
            map.stop();
            map = null;
          }
          startMenu();
        };
        map.start();
      });
    });
  };

  startMenu();
});
