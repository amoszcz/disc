import type { UnitType, GameConfig } from "../types/GameTypes.js";

export interface BattleUnit {
  id: string;
  unitTypeId: string; // Changed from 'type' to reference unit config
  team: 1 | 2;
  lifePercentage: number; // 0.0 to 1.0 (100%)
  position: {
    row: number;
    col: number;
  };
  // Optional stat modifiers (multipliers)
  statModifiers?: {
    attMultiplier?: number;
    lifMultiplier?: number;
  };
}

export interface BattleSetup {
  team1Units: BattleUnit[];
  team2Units: BattleUnit[];
  battlefieldConfig?: Partial<GameConfig>;
}

export interface BattleResult {
  winner: 1 | 2 | "draw";
  battleEnded: boolean;
  survivingUnits: {
    team1: BattleUnit[];
    team2: BattleUnit[];
  };
  casualties: {
    team1: BattleUnit[];
    team2: BattleUnit[];
  };
  totalDamageDealt: {
    team1: number;
    team2: number;
  };
  turnsElapsed: number;
  battleLog: BattleEvent[];
}

export interface BattleEvent {
  turn: number;
  type:
    | "attack"
    | "heal"
    | "death"
    | "turn_start"
    | "battle_start"
    | "battle_end";
  actorId: string;
  targetIds?: string[];
  damage?: number;
  healing?: number;
  message: string;
  timestamp: number;
}

export interface BattleModule {
  setupBattle(battleSetup: BattleSetup): Promise<void>;
  startBattle(): Promise<BattleResult>;
  pauseBattle(): void;
  resumeBattle(): void;
  endBattle(): BattleResult;
  getCurrentState(): BattleState;
  onBattleEvent?: (event: BattleEvent) => void;
  onBattleEnd?: (result: BattleResult) => void;
}

export interface BattleState {
  isActive: boolean;
  isPaused: boolean;
  currentTurn: 1 | 2;
  turnNumber: number;
  units: BattleUnit[];
  events: BattleEvent[];
}
export interface TeamCount {
  team1: number;
  team2: number;
}
