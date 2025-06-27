
import type { LoadedSvgData } from '../config/RenderConfig.js';
import type { Unit } from '../types/GameTypes.js';

export class SvgRenderer {
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    public drawSvg(
        ctx: CanvasRenderingContext2D,
        svgData: LoadedSvgData,
        centerX: number,
        centerY: number,
        size: number,
        unit: Unit,
        teamColor: string,
        strokeColor: string,
        isSelected: boolean
    ): void {
        const svgElement = svgData.element.cloneNode(true) as SVGElement;

        // Apply team colors to the SVG
        this.applyTeamColoring(svgElement, teamColor, unit);

        // Create a temporary canvas to render the SVG
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;

        // Set canvas size based on the desired rendering size
        const scale = size / Math.max(svgData.viewBox.width, svgData.viewBox.height);
        const scaledWidth = svgData.viewBox.width * scale;
        const scaledHeight = svgData.viewBox.height * scale;

        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;

        // Convert SVG to data URL and draw it
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            // Clear temp canvas
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Apply alpha based on unit health and status
            let alpha = Math.max(0.3, unit.lif / unit.maxLif);
            if (unit.hasActed) alpha *= 0.5;

            tempCtx.globalAlpha = alpha;
            tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            tempCtx.globalAlpha = 1;

            // Draw the SVG to the main canvas
            const drawX = centerX - scaledWidth / 2;
            const drawY = centerY - scaledHeight / 2;

            ctx.drawImage(tempCanvas, drawX, drawY);

            // Draw selection outline if selected
            if (isSelected) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.rect(drawX - 2, drawY - 2, scaledWidth + 4, scaledHeight + 4);
                ctx.stroke();
            }

            URL.revokeObjectURL(url);
        };

        img.src = url;
    }

    private applyTeamColoring(svgElement: SVGElement, teamColor: string, unit: Unit): void {
        // Find all elements that should be colored based on team
        const colorableElements = svgElement.querySelectorAll('[data-team-color]');

        colorableElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const colorType = htmlElement.getAttribute('data-team-color');

            switch (colorType) {
                case 'primary':
                    htmlElement.style.fill = `rgb(${teamColor})`;
                    break;
                case 'stroke':
                    htmlElement.style.stroke = `rgb(${teamColor})`;
                    break;
                case 'accent':
                    // Slightly darker version of team color
                    const [r, g, b] = teamColor.split(', ').map(Number);
                    htmlElement.style.fill = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
                    break;
            }
        });

        // Apply health-based opacity to health indicators
        const healthElements = svgElement.querySelectorAll('[data-health-indicator]');
        healthElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const healthRatio = unit.lif / unit.maxLif;
            htmlElement.style.opacity = healthRatio.toString();
        });
    }
}