import type { GameStateManager } from "../../game/GameState.js";

export type SelectUnitCommand = {
  type: "SelectUnit";
  row: number;
  col: number;
};

export type AttackCommand = {
  type: "Attack";
  targetRow: number;
  targetCol: number;
};

export type EndTurnCommand = {
  type: "EndTurn";
};

export type GameCommand = SelectUnitCommand | AttackCommand | EndTurnCommand;

export function applyCommand(gsm: GameStateManager, cmd: GameCommand) {
  switch (cmd.type) {
    case "SelectUnit":
      return gsm.selectUnit(cmd.row, cmd.col);
    case "Attack":
      return gsm.attemptAttack(cmd.targetRow, cmd.targetCol);
    case "EndTurn":
      gsm.switchTurn();
      return true;
  }
}
