import type { GameStateManager } from "../game/GameState.js";

export interface IGame {
  init(): Promise<boolean>;
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  getGameState(): GameStateManager;
  onGameEvent?: (event: any) => void;
  onGameEnd?: () => void;
}
