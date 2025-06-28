import {UnitType} from '../types/GameTypes.js';
import type {UnitVisualConfig} from '../config/RenderConfig.js';
import {ConfigLoader} from '../config/ConfigLoader.js';

export interface PreloadedAsset {
    baseImage: HTMLImageElement;
    team1Image: HTMLImageElement;
    team2Image: HTMLImageElement;
    width: number;
    height: number;
}

export class AssetManager {
    private static instance: AssetManager;
    private assets: Map<UnitType, PreloadedAsset> = new Map();
    private configLoader: ConfigLoader;
    private isInitialized: boolean = false;

    private constructor() {
        this.configLoader = ConfigLoader.getInstance();
    }

    public static getInstance(): AssetManager {
        if (!AssetManager.instance) {
            AssetManager.instance = new AssetManager();
        }
        return AssetManager.instance;
    }

    public async initializeAssets(): Promise<void> {
        if (this.isInitialized) return;

        console.log('Starting asset initialization...');

       
        const unitTypes: UnitType[] = [UnitType.ARCHER,UnitType.MAGE,UnitType.KNIGHT,UnitType.PRIEST];
        const loadPromises = unitTypes.map(unitType => this.loadUnitAsset(unitType));

        await Promise.all(loadPromises);

        this.isInitialized = true;
        console.log('All assets initialized successfully');
    }

    private async loadUnitAsset(unitType: UnitType): Promise<void> {
        const config = this.configLoader.getUnitRenderConfig(unitType);

        try {
            // Load the base SVG
            const svgElement = await this.fetchSvg(config.svgPath);
            const viewBox = this.extractViewBox(svgElement);

            // Create team-colored versions
            const baseImage = await this.createImageFromSvg(svgElement, config, null);
            const team1Image = await this.createImageFromSvg(svgElement, config, 1);
            const team2Image = await this.createImageFromSvg(svgElement, config, 2);

            const asset: PreloadedAsset = {
                baseImage,
                team1Image,
                team2Image,
                width: viewBox.width,
                height: viewBox.height
            };

            this.assets.set(unitType, asset);
            console.log(`Asset loaded for ${unitType}`);

        } catch (error) {
            console.error(`Failed to load asset for ${unitType}:`, error);
        }
    }

    private async fetchSvg(svgPath: string): Promise<SVGElement> {
        const response = await fetch(svgPath);
        if (!response.ok) {
            throw new Error(`Failed to load SVG: ${response.statusText}`);
        }

        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) {
            throw new Error('Invalid SVG file');
        }

        return svgElement;
    }

    private extractViewBox(svgElement: SVGElement): { width: number; height: number } {
        const viewBox = svgElement.getAttribute('viewBox');
        let width = 100, height = 100; // Default dimensions

        if (viewBox) {
            const [, , w, h] = viewBox.split(' ').map(Number);
            width = w;
            height = h;
        } else {
            const widthAttr = svgElement.getAttribute('width');
            const heightAttr = svgElement.getAttribute('height');
            if (widthAttr && heightAttr) {
                width = parseFloat(widthAttr);
                height = parseFloat(heightAttr);
            }
        }

        return { width, height };
    }

    private async createImageFromSvg(
        svgElement: SVGElement,
        config: UnitVisualConfig,
        team: 1 | 2 | null
    ): Promise<HTMLImageElement> {
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Apply team colors if team is specified
        if (team !== null) {
            const teamColor = team === 1 ? config.team1Color : config.team2Color;
            this.applyTeamColoring(clonedSvg, teamColor);
        }

        // Convert SVG to data URL
        const svgString = new XMLSerializer().serializeToString(clonedSvg);
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

        // Create and load image
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = svgDataUrl;
        });
    }

    private applyTeamColoring(svgElement: SVGElement, teamColor: string): void {
        // Find all elements that should be colored based on team
        const colorableElements = svgElement.querySelectorAll('[data-team-color]');

        colorableElements.forEach(element => {
            const colorType = element.getAttribute('data-team-color');

            switch (colorType) {
                case 'primary':
                    element.setAttribute('fill', `rgb(${teamColor})`);
                    break;
                case 'stroke':
                    element.setAttribute('stroke', `rgb(${teamColor})`);
                    break;
                case 'accent':
                    // Slightly darker version of team color
                    const [r, g, b] = teamColor.split(', ').map(Number);
                    element.setAttribute('fill', `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`);
                    break;
            }
        });
    }

    public getAsset(unitType: UnitType): PreloadedAsset | null {
        return this.assets.get(unitType) || null;
    }

    public isAssetManagerInitialized(): boolean {
        return this.isInitialized;
    }

    public clearAssets(): void {
        this.assets.clear();
        this.isInitialized = false;
    }
}