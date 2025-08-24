import type { GameStatus } from "../../types/GameTypes.js";
import type { BattleEvent } from "../../battle/BattleTypes.js";

export type CoreEvents = {
  startGame: void;
  gameStatusChanged: GameStatus;
  battleEvent: BattleEvent;
};
