import type { RenderStrategyConfig, UnitVisualConfig } from "./RenderConfig.js";
import type { UnitConfig, UnitConfigCollection } from "../types/UnitConfig.js";
import { SvgLoader } from "../utils/SvgLoader.js";
import unitRenderConfig from "./unit-render-config.json";
import unitConfig from "./unit-config.json";

export class ConfigLoader {
  private static instance: ConfigLoader;
  private renderConfig: RenderStrategyConfig;
  private unitConfigs: UnitConfigCollection;
  private svgLoader: SvgLoader;

  private constructor() {
    this.renderConfig = unitRenderConfig as RenderStrategyConfig;
    this.unitConfigs = unitConfig as UnitConfigCollection;
    this.svgLoader = SvgLoader.getInstance();
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  public getUnitConfig(unitTypeId: string): UnitConfig | null {
    return this.unitConfigs[unitTypeId.toLowerCase()] || null;
  }

  public getAllUnitConfigs(): UnitConfigCollection {
    return this.unitConfigs;
  }

  public getUnitRenderConfig(unitType: string): UnitVisualConfig {
    const config = this.renderConfig[unitType.toLowerCase()];
    if (!config) {
      // Return default config if unit type not found
      return {
        team1Color: "100, 100, 100",
        team2Color: "150, 150, 150",
        symbol: "?",
        svgPath: "/assets/units/default.svg",
        strokeColor: {
          team1: "#666666",
          team2: "#999999",
        },
      };
    }
    return config;
  }

  public getAllRenderConfigs(): RenderStrategyConfig {
    return this.renderConfig;
  }

  public async preloadAllSvgs(): Promise<void> {
    const svgPaths = Object.values(this.renderConfig).map(
      (config) => config.svgPath,
    );
    try {
      await this.svgLoader.preloadSvgs(svgPaths);
      console.log("All unit SVGs preloaded successfully");
    } catch (error) {
      console.warn("Some SVGs failed to preload:", error);
    }
  }

  // Method to reload config (useful for hot-reloading in development)
  public async reloadConfig(): Promise<void> {
    try {
      const [renderResponse, unitResponse] = await Promise.all([
        fetch("/src/config/unit-render-config.json"),
        fetch("/src/config/unit-config.json"),
      ]);

      this.renderConfig = await renderResponse.json();
      this.unitConfigs = await unitResponse.json();

      // Preload new SVGs
      await this.preloadAllSvgs();
    } catch (error) {
      console.warn("Failed to reload configs:", error);
    }
  }

  // Helper method to validate unit type exists
  public isValidUnitType(unitTypeId: string): boolean {
    return unitTypeId.toLowerCase() in this.unitConfigs;
  }

  // Get all available unit type IDs
  public getAvailableUnitTypes(): string[] {
    return Object.keys(this.unitConfigs);
  }
}
