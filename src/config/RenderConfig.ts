
export interface UnitVisualConfig {
    team1Color: string;
    team2Color: string;
    symbol: string;
    svgPath: string;
    strokeColor?: {
        team1: string;
        team2: string;
    };
    specialEffects?: {
        crosshairColor?: string;
        auraColor?: string;
        glowIntensity?: number;
        particleCount?: number;
    };
}

export interface RenderStrategyConfig {
    [unitType: string]: UnitVisualConfig;
}

export interface LoadedSvgData {
    element: SVGElement;
    viewBox: { width: number; height: number };
}