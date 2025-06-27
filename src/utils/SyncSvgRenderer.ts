import type { Unit } from '../types/GameTypes.js';
import type { PreloadedAsset } from './AssetManager.js';

export class SyncSvgRenderer {
    public static drawPreloadedAsset(
        ctx: CanvasRenderingContext2D,
        asset: PreloadedAsset,
        unit: Unit,
        centerX: number,
        centerY: number,
        size: number,
        strokeColor: string,
        isSelected: boolean
    ): void {
        // Choose the correct team image
        const image = unit.team === 1 ? asset.team1Image : asset.team2Image;

        // Calculate scaling and position
        const scale = size / Math.max(asset.width, asset.height);
        const scaledWidth = asset.width * scale;
        const scaledHeight = asset.height * scale;

        const drawX = centerX - scaledWidth / 2;
        const drawY = centerY - scaledHeight / 2;

        // Apply alpha based on unit health and status
        let alpha = Math.max(0.3, unit.lif / unit.maxLif);
        if (unit.hasActed) alpha *= 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw the image
        ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);

        ctx.restore();

        // Draw selection outline if selected
        if (isSelected) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.rect(drawX - 2, drawY - 2, scaledWidth + 4, scaledHeight + 4);
            ctx.stroke();
        }
    }
}