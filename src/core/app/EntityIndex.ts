import type { Unit } from "../../types/GameTypes.js";

export type UnitKey = string; // e.g., `${team}:${row}:${col}`

export class EntityIndex {
  private idMap: Map<UnitKey, Unit> = new Map();
  private team1: UnitKey[] = [];
  private team2: UnitKey[] = [];

  public rebuild(board: (Unit | null)[][]): void {
    this.idMap.clear();
    this.team1 = [];
    this.team2 = [];

    for (let r = 0; r < board.length; r++) {
      const row = board[r];
      for (let c = 0; c < row.length; c++) {
        const unit = row[c];
        if (unit && unit.isAlive) {
          const key = this.makeKey(unit.team, r, c);
          this.idMap.set(key, unit);
          if (unit.team === 1) this.team1.push(key);
          else this.team2.push(key);
        }
      }
    }
  }

  public getUnit(key: UnitKey): Unit | undefined {
    return this.idMap.get(key);
  }

  public getTeamRoster(team: 1 | 2): UnitKey[] {
    return team === 1 ? [...this.team1] : [...this.team2];
  }

  public countAlive(): { team1: number; team2: number } {
    return { team1: this.team1.length, team2: this.team2.length };
  }

  public static makeKey(team: 1 | 2, row: number, col: number): UnitKey {
    return `${team}:${row}:${col}`;
  }

  private makeKey(team: 1 | 2, row: number, col: number): UnitKey {
    return EntityIndex.makeKey(team, row, col);
  }
}
