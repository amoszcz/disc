import type { Unit, GameConfig } from '../../types/GameTypes.js';
import type { UnitVisualConfig, LoadedSvgData } from '../../config/RenderConfig.js';
import { ConfigLoader } from '../../config/ConfigLoader.js';
import { SvgLoader } from '../../utils/SvgLoader.js';
import { SvgRenderer } from '../../utils/SvgRenderer.js';
import type { UnitRenderStrategy } from './UnitRenderStrategy.js';

export abstract class BaseRenderStrategy implements UnitRenderStrategy {
    protected configLoader: ConfigLoader;
    protected svgLoader: SvgLoader;
    protected unitType: string;
    protected svgData: LoadedSvgData | null = null;
    protected svgRenderer: SvgRenderer | null = null;

    constructor(unitType: string) {
        this.configLoader = ConfigLoader.getInstance();
        this.svgLoader = SvgLoader.getInstance();
        this.unitType = unitType;
    }

    public getVisualConfig(): UnitVisualConfig {
        return this.configLoader.getUnitRenderConfig(this.unitType);
    }

    public async initializeSvg(canvas: HTMLCanvasElement): Promise<void> {
        const visualConfig = this.getVisualConfig();

        try {
            this.svgData = await this.svgLoader.loadSvg(visualConfig.svgPath);
            this.svgRenderer = new SvgRenderer(canvas);
        } catch (error) {
            console.warn(`Failed to load SVG for ${this.unitType}:`, error);
            this.svgData = null;
            this.svgRenderer = null;
        }
    }

    public drawUnitShape(
        ctx: CanvasRenderingContext2D,
        unit: Unit,
        centerX: number,
        centerY: number,
        config: GameConfig,
    ): void {
        const visualConfig = this.getVisualConfig();

        if (this.svgData && this.svgRenderer) {
            debugger;
            // Use SVG rendering
            const baseColor = unit.team === 1 ? visualConfig.team1Color : visualConfig.team2Color;
            const strokeColors = visualConfig.strokeColor;
            const strokeColor = strokeColors
                ? (unit.team === 1 ? strokeColors.team1 : strokeColors.team2)
                : (unit.team === 1 ? "#2c5282" : "#c53030");

            this.svgRenderer.drawSvg(
                ctx,
                this.svgData,
                centerX,
                centerY,
                config.UNIT_RADIUS * 2, // SVG size
                unit,
                baseColor,
                strokeColor,
                unit.isSelected
            );
        } else {
            // Fallback to circle rendering if SVG failed to load
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