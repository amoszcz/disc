
import type { Unit, GameConfig } from '../../types/GameTypes.js';

export interface UnitVisualConfig {
    team1Color: string;
    team2Color: string;
    symbol: string;
    customShape?: (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => void;
    customEffects?: (ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, radius: number) => void;
}

export interface UnitRenderStrategy {
    getVisualConfig(): UnitVisualConfig;
    drawUnitShape(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void;
    drawSpecialEffects?(ctx: CanvasRenderingContext2D, unit: Unit, centerX: number, centerY: number, config: GameConfig): void;
    getUnitTypeName(): string;
}