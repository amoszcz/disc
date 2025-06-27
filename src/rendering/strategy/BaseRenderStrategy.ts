
import type { Unit, GameConfig } from '../../types/GameTypes.js';
import type { UnitVisualConfig } from '../../config/RenderConfig.js';
import { ConfigLoader } from '../../config/ConfigLoader.js';
import { AssetManager } from '../../utils/AssetManager.js';
import { SyncSvgRenderer } from '../../utils/SyncSvgRenderer.js';
import type { UnitRenderStrategy } from './UnitRenderStrategy.js';

export abstract class BaseRenderStrategy implements UnitRenderStrategy {
    protected configLoader: ConfigLoader;
    protected assetManager: AssetManager;
    protected unitType: string;

    constructor(unitType: string) {
        this.configLoader = ConfigLoader.getInstance();
        this.assetManager = AssetManager.getInstance();
        this.unitType = unitType;
    }

    public getVisualConfig(): UnitVisualConfig {
        return this.configLoader.getUnitRenderConfig(this.unitType);
    }

    public drawUnitShape(
        ctx: CanvasRenderingContext2D,
        unit: Unit,
        centerX: number,
        centerY: number,
        config: GameConfig,
    ): void {
        const visualConfig = this.getVisualConfig();
        const asset = this.assetManager.getAsset(unit.type);

        if (asset) {
            // Use preloaded SVG asset
            const strokeColors = visualConfig.strokeColor;
            const strokeColor = strokeColors
                ? (unit.team === 1 ? strokeColors.team1 : strokeColors.team2)
                : (unit.team === 1 ? "#2c5282" : "#c53030");

            SyncSvgRenderer.drawPreloadedAsset(
                ctx,
                asset,
                unit,
                centerX,
                centerY,
                config.UNIT_RADIUS * 2, // SVG size
                strokeColor,
                unit.isSelected
            );
        } else {
            // Fallback to circle rendering if asset not available
            this.drawFallbackShape(ctx, unit, centerX, centerY, config, visualConfig);
        }
    }

    private drawFallbackShape(
        ctx: CanvasRenderingContext2D,
        unit: Unit,
        centerX: number,
        centerY: number,
        config: GameConfig,
        visualConfig: UnitVisualConfig
    ): void {
        // Draw standard circle as fallback
        ctx.beginPath();
        ctx.arc(centerX, centerY, config.UNIT_RADIUS, 0, 2 * Math.PI);

        const baseColor = unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;

        let alpha = Math.max(0.3, unit.lif / unit.maxLif);
        if (unit.hasActed) alpha *= 0.5;

        ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
        ctx.fill();

        // Use stroke color from config if available
        const strokeColors = visualConfig.strokeColor;
        const strokeColor = strokeColors
            ? (unit.team === 1 ? strokeColors.team1 : strokeColors.team2)
            : (unit.team === 1 ? "#2c5282" : "#c53030");

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = unit.isSelected ? 5 : 3;
        ctx.stroke();

        // Draw symbol as fallback
        ctx.fillStyle = "white";
        ctx.font = `${config.UNIT_RADIUS}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(visualConfig.symbol, centerX, centerY);
    }

    public abstract drawSpecialEffects(
        ctx: CanvasRenderingContext2D,
        unit: Unit,
        centerX: number,
        centerY: number,
        config: GameConfig,
    ): void;

    public getUnitTypeName(): string {
        return this.unitType.charAt(0).toUpperCase() + this.unitType.slice(1);
    }
}