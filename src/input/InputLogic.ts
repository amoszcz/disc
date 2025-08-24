export type GameStatus = "playing" | "paused" | "game_over" | string;

export type InputAction =
  | "pause"
  | "resume"
  | "switchTurn"
  | "returnToMenu"
  | null;

export function mapKeyToAction(status: GameStatus, key: string): InputAction {
  const k = key.toLowerCase();
  switch (k) {
    case "r":
      return status === "game_over" ? "returnToMenu" : null;
    case "escape":
      if (status === "playing") return "pause";
      if (status === "paused") return "resume";
      return null;
    case " ":
      return status === "playing" ? "switchTurn" : null;
    default:
      return null;
  }
}
