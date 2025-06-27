import type { LoadedSvgData } from '../config/RenderConfig.js';

export class SvgLoader {
    private static instance: SvgLoader;
    private svgCache: Map<string, LoadedSvgData> = new Map();
    private loadingPromises: Map<string, Promise<LoadedSvgData>> = new Map();

    private constructor() {}

    public static getInstance(): SvgLoader {
        if (!SvgLoader.instance) {
            SvgLoader.instance = new SvgLoader();
        }
        return SvgLoader.instance;
    }

    public async loadSvg(svgPath: string): Promise<LoadedSvgData> {
        // Return cached SVG if available
        if (this.svgCache.has(svgPath)) {
            return this.svgCache.get(svgPath)!;
        }

        // Return existing loading promise if already in progress
        if (this.loadingPromises.has(svgPath)) {
            return this.loadingPromises.get(svgPath)!;
        }

        // Start loading the SVG
        const loadingPromise = this.fetchAndParseSvg(svgPath);
        this.loadingPromises.set(svgPath, loadingPromise);

        try {
            const svgData = await loadingPromise;
            this.svgCache.set(svgPath, svgData);
            this.loadingPromises.delete(svgPath);
            return svgData;
        } catch (error) {
            this.loadingPromises.delete(svgPath);
            throw error;
        }
    }

    private async fetchAndParseSvg(svgPath: string): Promise<LoadedSvgData> {
        try {
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

            // Extract viewBox dimensions
            const viewBox = svgElement.getAttribute('viewBox');
            let width = 100, height = 100; // Default dimensions

            if (viewBox) {
                const [, , w, h] = viewBox.split(' ').map(Number);
                width = w;
                height = h;
            } else {
                // Try to get width/height attributes
                const widthAttr = svgElement.getAttribute('width');
                const heightAttr = svgElement.getAttribute('height');
                if (widthAttr && heightAttr) {
                    width = parseFloat(widthAttr);
                    height = parseFloat(heightAttr);
                }
            }

            return {
                element: svgElement,
                viewBox: { width, height }
            };
        } catch (error) {
            console.error(`Error loading SVG from ${svgPath}:`, error);
            throw error;
        }
    }

    public preloadSvgs(svgPaths: string[]): Promise<LoadedSvgData[]> {
        return Promise.all(svgPaths.map(path => this.loadSvg(path)));
    }

    public clearCache(): void {
        this.svgCache.clear();
        this.loadingPromises.clear();
    }
}