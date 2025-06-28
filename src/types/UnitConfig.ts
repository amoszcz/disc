export interface UnitConfig {
  unitTypeId: string;
  name: string;
  baseStats: {
    att: number;
    lif: number;
  };
  attackStrategyId: string;
  renderStrategyId: string;
  description?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

export interface UnitConfigCollection {
  [unitTypeId: string]: UnitConfig;
}
