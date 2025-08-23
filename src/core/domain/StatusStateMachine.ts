import { GameStatus } from "../../types/GameTypes.js";

export type StatusTransition = {
  from: GameStatus;
  to: GameStatus;
};

export class StatusStateMachine {
  private allowed: Map<GameStatus, Set<GameStatus>> = new Map();

  constructor() {
    // Default allowed transitions
    this.allowed.set(GameStatus.MENU, new Set([GameStatus.PLAYING]));
    this.allowed.set(
      GameStatus.PLAYING,
      new Set([GameStatus.PAUSED, GameStatus.GAME_OVER]),
    );
    this.allowed.set(
      GameStatus.PAUSED,
      new Set([GameStatus.PLAYING, GameStatus.MENU]),
    );
    this.allowed.set(GameStatus.GAME_OVER, new Set([GameStatus.MENU]));
  }

  public canTransition(from: GameStatus, to: GameStatus): boolean {
    if (from === to) return true;
    const set = this.allowed.get(from);
    return !!set && set.has(to);
  }

  public allow(from: GameStatus, to: GameStatus): void {
    const set = this.allowed.get(from) || new Set<GameStatus>();
    set.add(to);
    this.allowed.set(from, set);
  }
}
